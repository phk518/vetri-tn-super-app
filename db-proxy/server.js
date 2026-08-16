const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 27018;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'tvs_app_db';

app.use(cors());
app.use(express.json());

let db;

// Connection Pooling: Initialize MongoClient once at startup
MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Utility to handle ObjectId serialization recursively
function mapObjectId(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(mapObjectId);
  if (typeof obj === 'object') {
    if (obj instanceof ObjectId) return obj.toString();
    const newObj = {};
    for (const key in obj) {
      if (key === '_id' && obj[key] instanceof ObjectId) {
        newObj['id'] = obj[key].toString(); // Map _id to id for Rust
      } else {
        newObj[key] = mapObjectId(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Global error handler utility
function handleError(res, err) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate key error' });
  }
  return res.status(500).json({ error: 'Internal server error', details: err.message });
}

// ==========================================
// Generic CRUD Routes for any collection
// ==========================================

// Create
app.post('/proxy/:collection', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    
    // Convert string 'id' to ObjectId if it's explicitly passed as _id, though usually inserts shouldn't pass _id
    const data = { ...req.body };
    if (data.id) {
       data._id = data.id.length === 24 ? new ObjectId(data.id) : data.id;
       delete data.id;
    }

    const result = await collection.insertOne(data);
    res.status(201).json({ id: result.insertedId.toString() });
  } catch (err) {
    handleError(res, err);
  }
});

// Get Many
app.get('/proxy/:collection', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    
    // Parse query filters
    let filter = {};
    for (let key in req.query) {
       filter[key] = req.query[key];
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
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch(e) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }
    
    const doc = await collection.findOne({ _id: id });
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
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch(e) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }
    
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete One by ID
app.delete('/proxy/:collection/:id', async (req, res) => {
  try {
    const collection = db.collection(req.params.collection);
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch(e) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }
    
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

app.listen(port, () => {
  console.log(`DB Proxy running at http://localhost:${port}`);
});
