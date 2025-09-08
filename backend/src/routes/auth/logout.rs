use crate::response::make_query_response;
use actix_web::{HttpResponse, post};

#[post("")]
pub async fn logout() -> HttpResponse {
    HttpResponse::Ok()
        .insert_header((
            "Set-Cookie",
            "__Host-access=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
        ))
        .json(make_query_response::<()>(true, None, None, None))
}
