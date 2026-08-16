use reqwest::Client;

pub async fn setup_database() -> Result<Client, String> {
    Ok(Client::new())
}

