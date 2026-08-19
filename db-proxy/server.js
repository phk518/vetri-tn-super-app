const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 27018;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'tvs_app_db';

// Middleware
app.use(cors());
app.use(express.json());

let client;
let db;

// Utility to convert string to ObjectId if valid 24-hex string
function toObjectId(id) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && id.length === 24 && ObjectId.isValid(id)) {
    try {
      return new ObjectId(id);
    } catch {
      return null;
    }
  }
  return null;
}

// Utility to build an ID query that matches both ObjectId and string formats
function buildIdQuery(idParam) {
  const oid = toObjectId(idParam);
  if (oid) {
    return { $or: [{ _id: oid }, { _id: idParam }] };
  }
  return { _id: idParam };
}

// Utility to handle ObjectId and Date serialization recursively
function mapObjectId(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof ObjectId || (typeof obj === 'object' && obj._bsontype === 'ObjectId')) {
    return obj.toString();
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(mapObjectId);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '_id') {
        const idStr = value ? value.toString() : value;
        newObj['_id'] = idStr;
        newObj['id'] = idStr; // Map _id to id for Rust & JSON clients
      } else {
        newObj[key] = mapObjectId(value);
      }
    }
    return newObj;
  }
  return obj;
}

// Global error handler utility
function handleError(res, err) {
  if (res.headersSent) return;
  console.error('[DB-Proxy Error]:', err);
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate key error', details: err.message });
  }
  if (err.name === 'BSONError') {
    return res.status(400).json({ error: 'Invalid ObjectId format', details: err.message });
  }
  return res.status(500).json({ error: 'Internal server error', details: err.message });
}

// Middleware: Verify DB connection is established
app.use((req, res, next) => {
  if (!db && req.path !== '/health') {
    return res.status(503).json({ error: 'Database connection not ready' });
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: db ? 'connected' : 'connecting',
    database: dbName,
    port: Number(port),
  });
});

// ==========================================
// Generic CRUD Routes for any collection
// ==========================================

// Create
app.post('/proxy/:collection', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    const data = { ...req.body };

    // Handle incoming _id or id if provided
    if (data.id && !data._id) {
      const oid = toObjectId(data.id);
      data._id = oid || data.id;
      delete data.id;
    } else if (data._id && typeof data._id === 'string') {
      const oid = toObjectId(data._id);
      if (oid) {
        data._id = oid;
      }
    }

    const result = await collection.insertOne(data);
    const insertedIdStr = result.insertedId.toString();

    // Return the full inserted document representation with both _id and id
    // to satisfy Rust serde deserialization (UserModel, ApplicationModel, etc.)
    const createdDoc = {
      ...data,
      _id: insertedIdStr,
      id: insertedIdStr,
    };

    res.status(201).json(mapObjectId(createdDoc));
  } catch (err) {
    handleError(res, err);
  }
});

// Get Many
app.get('/proxy/:collection', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);

    // Parse query filters
    const filter = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (key === '_id') {
        const oid = toObjectId(value);
        filter['_id'] = oid ? { $in: [oid, value] } : value;
      } else if (key === 'id') {
        const oid = toObjectId(value);
        filter['_id'] = oid ? { $in: [oid, value] } : value;
      } else {
        filter[key] = value;
      }
    }

    const docs = await collection.find(filter).toArray();
    res.status(200).json(mapObjectId(docs));
  } catch (err) {
    handleError(res, err);
  }
});

// Get One by ID
app.get('/proxy/:collection/:id', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    const query = buildIdQuery(req.params.id);

    const doc = await collection.findOne(query);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json(mapObjectId(doc));
  } catch (err) {
    handleError(res, err);
  }
});

// Update One by ID
app.put('/proxy/:collection/:id', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    const query = buildIdQuery(req.params.id);

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    // Check if the payload already contains MongoDB update operators ($set, etc.)
    const hasOperators = Object.keys(updateData).some(k => k.startsWith('$'));
    const updateDoc = hasOperators ? updateData : { $set: updateData };

    const result = await collection.updateOne(query, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete One by ID
app.delete('/proxy/:collection/:id', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    const query = buildIdQuery(req.params.id);

    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    handleError(res, err);
  }
});

// Start server function
async function startServer() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    console.log(`Connected successfully to MongoDB at ${mongoUrl}`);
    db = client.db(dbName);

    const server = app.listen(port, () => {
      console.log(`DB Proxy running at http://localhost:${port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down DB Proxy...`);
      server.close(async () => {
        if (client) {
          await client.close();
          console.log('MongoDB connection closed.');
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
