use crate::{response::make_query_response, util::token::decode_token};
use actix_web::{HttpRequest, HttpResponse, get, web};
use entity::urls;
use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter};

#[get("")]
pub async fn list_url(req: HttpRequest, db: web::Data<DatabaseConnection>) -> HttpResponse {
    let token = match req.cookie("__Host-access") {
        Some(c) => c.value().to_string(),
        None => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                Some("Missing token cookie"),
                None,
            ));
        }
    };

    let decoded = match decode_token(token) {
        Ok(t) => t,
        Err(_) => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                Some("Invalid token"),
                None,
            ));
        }
    };

    let urls: Result<Vec<urls::Model>, DbErr> = urls::Entity::find()
        .filter(urls::Column::UserId.eq(decoded.claims.sub))
        .all(db.get_ref())
        .await;

    HttpResponse::Ok().json(make_query_response(
        true,
        Some(&urls.unwrap_or_default()),
        None,
        None,
    ))
}
