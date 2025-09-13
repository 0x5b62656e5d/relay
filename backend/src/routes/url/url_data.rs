use crate::{response::make_query_response, util::token::decode_token, validate_path};
use actix_web::{HttpRequest, HttpResponse, get, web};
use entity::{clicks, urls};
use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter};
use serde::Serialize;

#[derive(Serialize)]
struct UrlData {
    url_data: urls::Model,
    clicks: Vec<clicks::Model>,
}

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

    let url: Result<Option<urls::Model>, DbErr> = urls::Entity::find()
        .filter(urls::Column::Id.eq(url_id.into_inner()))
        .filter(urls::Column::UserId.eq(decoded.claims.sub))
        .one(db.get_ref())
        .await;

    match url {
        Ok(Some(url)) => {
            let clicks: Vec<clicks::Model> = clicks::Entity::find()
                .filter(clicks::Column::UrlId.eq(url.id.clone()))
                .all(db.get_ref())
                .await
                .unwrap();

            HttpResponse::Ok().json(make_query_response(
                true,
                Some(&UrlData {
                    url_data: url,
                    clicks,
                }),
                None,
                None,
            ))
        }
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
