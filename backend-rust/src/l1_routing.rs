use axum::{
    routing::post,
    routing::get,
    Router,
};
use reqwest::Client;
use std::sync::Arc;
use crate::l2_controllers::{
    register_controller, login_controller, create_application_controller,
    get_applications_controller, get_application_events_controller
};

pub fn create_router(client: Client) -> Router {
    let state = Arc::new(client);
    
    Router::new()
        .route("/api/auth/register", post(register_controller))
        .route("/api/auth/login", post(login_controller))
        .route("/api/applications", post(create_application_controller).get(get_applications_controller))
        .route("/api/application_events", get(get_application_events_controller))
        .with_state(state)
}
