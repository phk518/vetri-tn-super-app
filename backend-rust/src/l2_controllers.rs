use axum::{Json, http::StatusCode};
use crate::l3_request_validation::{RegisterRequest, LoginRequest, CreateApplicationRequest};
use crate::l4_application_services::{AuthService, AppService};
use crate::l8_data_access::{HttpUserRepository, HttpApplicationRepository};
use reqwest::Client;
use std::sync::Arc;
use serde_json::{json, Value};
use validator::Validate;

pub async fn register_controller(
    axum::extract::State(client): axum::extract::State<Arc<Client>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    if let Err(e) = payload.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }
    
    let user_repo = HttpUserRepository::new(&client);
    let auth_service = AuthService { user_repo };
    
    match auth_service.register(payload).await {
        Ok(id) => Ok(Json(json!({ "id": id }))),
        Err(e) => Err((StatusCode::BAD_REQUEST, e)),
    }
}

pub async fn login_controller(
    axum::extract::State(client): axum::extract::State<Arc<Client>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    if let Err(e) = payload.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let user_repo = HttpUserRepository::new(&client);
    let auth_service = AuthService { user_repo };

    match auth_service.login(payload).await {
        Ok(token) => Ok(Json(json!({ "token": token }))),
        Err(e) => Err((StatusCode::UNAUTHORIZED, e)),
    }
}

pub async fn create_application_controller(
    axum::extract::State(client): axum::extract::State<Arc<Client>>,
    Json(payload): Json<CreateApplicationRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let app_repo = HttpApplicationRepository::new(&client);
    let app_service = AppService { app_repo };

    match app_service.create_application(payload).await {
        Ok(id) => Ok(Json(json!({ "id": id }))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e)),
    }
}

pub async fn get_applications_controller(
    axum::extract::State(client): axum::extract::State<Arc<Client>>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let app_repo = HttpApplicationRepository::new(&client);
    let app_service = AppService { app_repo };

    match app_service.get_all_applications().await {
        Ok(apps) => Ok(Json(json!(apps))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e)),
    }
}

pub async fn get_application_events_controller(
    axum::extract::State(client): axum::extract::State<Arc<Client>>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let app_repo = HttpApplicationRepository::new(&client);
    let app_service = AppService { app_repo };

    match app_service.get_all_events().await {
        Ok(events) => Ok(Json(json!(events))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e)),
    }
}

