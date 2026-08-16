use crate::l5_domain_entities::{UserEntity, ApplicationEntity, ApplicationEventEntity};
use axum::async_trait;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, String>;
    async fn create(&self, user: UserEntity) -> Result<String, String>;
}

#[async_trait]
pub trait ApplicationRepository: Send + Sync {
    async fn create_application_with_event(&self, app: ApplicationEntity, event: ApplicationEventEntity) -> Result<String, String>;
    async fn find_by_service_type(&self, service_type: &str) -> Result<Vec<ApplicationEntity>, String>;
    async fn find_all(&self) -> Result<Vec<ApplicationEntity>, String>;
    async fn find_all_events(&self) -> Result<Vec<ApplicationEventEntity>, String>;
}
