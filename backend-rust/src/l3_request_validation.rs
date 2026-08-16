use serde::Deserialize;
use validator::Validate;

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
    // Accepts serviceType from API and maps to service_type in Rust, fixing the bug.
    #[serde(rename = "serviceType", alias = "service_type")]
    pub service_type: String, 
}
