use crate::util::token::decode_token;
use crate::{response::make_query_response, validate_path};
use actix_web::{HttpRequest, HttpResponse, get, web};
use entity::urls;
use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter};

#[get("/{url_id}")]
pub async fn get_url_data(
    url_id: Result<web::Path<String>, actix_web::error::Error>,
    req: HttpRequest,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let url_id: web::Path<String> = validate_path!(url_id, "Invalid URL ID");

    let token = match req.cookie("__Host-access") {
        Some(c) => c.value().to_string(),
        None => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                None,
                Some("Missing token cookie"),
            ));
        }
    };

    let decoded = match decode_token(token) {
        Ok(t) => t,
        Err(_) => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                None,
                Some("Invalid token"),
            ));
        }
    };

    let url: Result<Option<urls::Model>, DbErr> = urls::Entity::find()
        .filter(urls::Column::Id.eq(url_id.into_inner()))
        .filter(urls::Column::UserId.eq(decoded.claims.sub))
        .one(db.get_ref())
        .await;

    match url {
        Ok(Some(url)) => HttpResponse::Ok().json(make_query_response(true, Some(&url), None, None)),
        Ok(None) => HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            Some("URL not found"),
            None,
        )),
        Err(_) => HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Failed to fetch URL"),
            None,
        )),
    }
}
