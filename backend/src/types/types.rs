use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Url {
    pub id: String,
    pub url: String,
    pub created_at: NaiveDateTime,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct TokenClaim {
    pub sub: String,
    pub iat: i64,
    pub exp: i64,
}
