use crate::l5_domain_entities::{UserEntity, ApplicationEntity, ApplicationEventEntity};
use crate::l9_data_models::{UserModel, ApplicationModel, ApplicationEventModel};
use crate::l7_repository_interfaces::{UserRepository, ApplicationRepository};
use chrono::Utc;
use axum::async_trait;
use reqwest::Client;

pub struct HttpUserRepository {
    client: Client,
}

impl HttpUserRepository {
    pub fn new(client: &Client) -> Self {
        Self {
            client: client.clone(),
        }
    }
}

#[async_trait]
impl UserRepository for HttpUserRepository {
    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, String> {
        // Query the Node.js db-proxy
        let url = format!("http://127.0.0.1:27018/proxy/users?email={}", email);
        let resp = self.client.get(&url).send().await.map_err(|e| e.to_string())?;
        
        if resp.status().is_success() {
            let users: Vec<UserModel> = resp.json().await.map_err(|e| e.to_string())?;
            if let Some(m) = users.into_iter().next() {
                return Ok(Some(UserEntity {
                    id: m.id,
                    email: m.email,
                    password_hash: m.password_hash,
                }));
            }
        }
        Ok(None)
    }

    async fn create(&self, user: UserEntity) -> Result<String, String> {
        let url = "http://127.0.0.1:27018/proxy/users";
        let model = UserModel {
            id: None,
            email: user.email,
            password_hash: user.password_hash,
            created_at: Utc::now(),
        };
        
        let resp = self.client.post(url).json(&model).send().await.map_err(|e| e.to_string())?;
        
        if resp.status().is_success() {
            let created: UserModel = resp.json().await.map_err(|e| e.to_string())?;
            Ok(created.id.unwrap_or_default())
        } else {
            Err("Failed to create user".to_string())
        }
    }
}

pub struct HttpApplicationRepository {
    client: Client,
}

impl HttpApplicationRepository {
    pub fn new(client: &Client) -> Self {
        Self {
            client: client.clone(),
        }
    }
}

#[async_trait]
impl ApplicationRepository for HttpApplicationRepository {
    async fn create_application_with_event(&self, app: ApplicationEntity, event: ApplicationEventEntity) -> Result<String, String> {
        let app_url = "http://127.0.0.1:27018/proxy/applications";
        let app_model = ApplicationModel {
            id: None,
            user_id: app.user_id,
            service_type: app.service_type,
            status: app.status,
            created_at: Utc::now(),
        };
        
        let resp = self.client.post(app_url).json(&app_model).send().await.map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err("Failed to create application".to_string());
        }
        
        let created_app: ApplicationModel = resp.json().await.map_err(|e| e.to_string())?;
        let app_id = created_app.id.unwrap_or_default();
        
        let event_url = "http://127.0.0.1:27018/proxy/application_events";
        let event_model = ApplicationEventModel {
            id: None,
            application_id: app_id.clone(),
            event_type: event.event_type,
            created_at: Utc::now(),
        };
        
        let _ = self.client.post(event_url).json(&event_model).send().await;
        
        Ok(app_id)
    }
    
    async fn find_by_service_type(&self, service_type: &str) -> Result<Vec<ApplicationEntity>, String> {
        let url = format!("http://127.0.0.1:27018/proxy/applications?service_type={}", service_type);
        let resp = self.client.get(&url).send().await.map_err(|e| e.to_string())?;
        
        if resp.status().is_success() {
            let apps: Vec<ApplicationModel> = resp.json().await.map_err(|e| e.to_string())?;
            let entities = apps.into_iter().map(|m| ApplicationEntity {
                id: m.id,
                user_id: m.user_id,
                service_type: m.service_type,
                status: m.status,
                created_at: Some(m.created_at),
            }).collect();
            Ok(entities)
        } else {
            Err("Failed to fetch applications".to_string())
        }
    }

    async fn find_all(&self) -> Result<Vec<ApplicationEntity>, String> {
        let url = "http://127.0.0.1:27018/proxy/applications";
        let resp = self.client.get(url).send().await.map_err(|e| e.to_string())?;
        
        if resp.status().is_success() {
            let apps: Vec<ApplicationModel> = resp.json().await.map_err(|e| e.to_string())?;
            let entities = apps.into_iter().map(|m| ApplicationEntity {
                id: m.id,
                user_id: m.user_id,
                service_type: m.service_type,
                status: m.status,
                created_at: Some(m.created_at),
            }).collect();
            Ok(entities)
        } else {
            Err("Failed to fetch all applications".to_string())
        }
    }

    async fn find_all_events(&self) -> Result<Vec<ApplicationEventEntity>, String> {
        let url = "http://127.0.0.1:27018/proxy/application_events";
        let resp = self.client.get(url).send().await.map_err(|e| e.to_string())?;
        
        if resp.status().is_success() {
            let events: Vec<ApplicationEventModel> = resp.json().await.map_err(|e| e.to_string())?;
            let entities = events.into_iter().map(|m| ApplicationEventEntity {
                id: m.id,
                application_id: Some(m.application_id),
                event_type: m.event_type,
                changed_at: Some(m.created_at),
            }).collect();
            Ok(entities)
        } else {
            Err("Failed to fetch all application events".to_string())
        }
    }
}

