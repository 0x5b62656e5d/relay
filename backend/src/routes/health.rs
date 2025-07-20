use crate::response::make_query_response;
use actix_web::{HttpResponse, get};
use chrono::Local;

#[get("")]
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(make_query_response(
        true,
        Some(&Local::now().to_rfc3339()),
        None,
        Some("Service is healthy"),
    ))
}
