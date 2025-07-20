use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Url {
    pub id: String,
    pub url: String,
    pub created_at: NaiveDateTime,
}
