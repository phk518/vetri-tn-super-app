use crate::l5_domain_entities::{UserEntity, ApplicationEntity, ApplicationEventEntity};
use crate::l6_domain_services::{PasswordService, ApplicationStatusService};
use crate::l7_repository_interfaces::{UserRepository, ApplicationRepository};
use crate::l3_request_validation::{RegisterRequest, LoginRequest, CreateApplicationRequest};
use serde::{Serialize, Deserialize};
use chrono::{Utc, Duration};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

pub struct AuthService<R: UserRepository> {
    pub user_repo: R,
}

impl<R: UserRepository> AuthService<R> {
    pub async fn register(&self, req: RegisterRequest) -> Result<String, String> {
        if self.user_repo.find_by_email(&req.email).await?.is_some() {
            return Err("User already exists".to_string());
        }
        let password_hash = PasswordService::hash_password(&req.password)?;
        let user = UserEntity {
            id: None,
            email: req.email,
            password_hash,
        };
        self.user_repo.create(user).await
    }

    pub async fn login(&self, req: LoginRequest) -> Result<String, String> {
        let user = self.user_repo.find_by_email(&req.email).await?
            .ok_or_else(|| "Invalid credentials".to_string())?;
            
        if !PasswordService::verify_password(&req.password, &user.password_hash)? {
            return Err("Invalid credentials".to_string());
        }

        let expiration = Utc::now()
            .checked_add_signed(Duration::try_hours(24).expect("valid duration"))
            .expect("valid timestamp")
            .timestamp() as usize;

        let claims = Claims {
            sub: user.id.unwrap(),
            exp: expiration,
        };

        let token = format!("{}.{}.mock_signature", claims.sub, claims.exp);

        Ok(token)
    }
}

pub struct AppService<R: ApplicationRepository> {
    pub app_repo: R,
}

impl<R: ApplicationRepository> AppService<R> {
    pub async fn create_application(&self, req: CreateApplicationRequest) -> Result<String, String> {
        let status = ApplicationStatusService::initial_status();
        let created_at = Utc::now();
        let sla_duration_minutes = 14400; // 10 days
        let sla_deadline = created_at + Duration::try_minutes(sla_duration_minutes as i64).unwrap();

        let app = ApplicationEntity {
            id: None,
            user_id: req.user_id,
            service_type: req.service_type,
            status,
            applicant_name: req.applicant_name,
            created_at: Some(created_at),
            sla_duration_minutes: Some(sla_duration_minutes),
            sla_deadline: Some(sla_deadline),
            breached_at: None,
            resolved_at: None,
            last_status_change: Some(created_at),
            service_payload: req.service_payload,
            assigned_officer_id: None,
            department_code: req.department_code,
            office_code: None,
            deleted_at: None,
        };
        let event = ApplicationEventEntity {
            id: None,
            application_id: None,
            event_type: "CREATED".to_string(),
            changed_at: Some(Utc::now()),
        };
        self.app_repo.create_application_with_event(app, event).await
    }

    pub async fn get_all_applications(&self) -> Result<Vec<ApplicationEntity>, String> {
        self.app_repo.find_all().await
    }

    pub async fn get_all_events(&self) -> Result<Vec<ApplicationEventEntity>, String> {
        self.app_repo.find_all_events().await
    }
}
