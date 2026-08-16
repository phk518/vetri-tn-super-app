use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserEntity {
    pub id: Option<String>,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationEntity {
    #[serde(rename = "_id")]
    pub id: Option<String>,
    pub user_id: String,
    pub service_type: String,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationEventEntity {
    #[serde(rename = "_id")]
    pub id: Option<String>,
    pub application_id: Option<String>,
    pub event_type: String,
    pub changed_at: Option<DateTime<Utc>>,
}
