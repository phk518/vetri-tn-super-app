use serde::Deserialize;
use validator::Validate;
use serde_json::Value;

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 6))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateApplicationRequest {
    pub user_id: String,
    #[serde(rename = "serviceType", alias = "service_type")]
    pub service_type: String, 
    pub applicant_name: Option<String>,
    pub department_code: Option<String>,
    pub service_payload: Option<Value>,
}
