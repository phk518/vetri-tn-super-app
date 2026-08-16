pub mod l1_routing;
pub mod l2_controllers;
pub mod l3_request_validation;
pub mod l4_application_services;
pub mod l5_domain_entities;
pub mod l6_domain_services;
pub mod l7_repository_interfaces;
pub mod l8_data_access;
pub mod l9_data_models;
pub mod l10_infrastructure;

use l1_routing::create_router;
use l10_infrastructure::setup_database;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let db_client = setup_database().await.expect("Failed to setup database");
    
    let app = create_router(db_client);

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Server running on 0.0.0.0:8080");
    axum::serve(listener, app).await.unwrap();
}
