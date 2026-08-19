use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserModel {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct ApplicationModel {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub user_id: String,
    pub service_type: String,
    pub status: String,
    pub applicant_name: Option<String>,
    pub created_at: DateTime<Utc>,
    pub sla_duration_minutes: Option<i32>,
    pub sla_deadline: Option<DateTime<Utc>>,
    pub breached_at: Option<DateTime<Utc>>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub last_status_change: Option<DateTime<Utc>>,
    pub service_payload: Option<Value>,
    pub assigned_officer_id: Option<String>,
    pub department_code: Option<String>,
    pub office_code: Option<String>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApplicationEventModel {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub application_id: String,
    pub event_type: String,
    pub created_at: DateTime<Utc>,
}
