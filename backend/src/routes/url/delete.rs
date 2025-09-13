use crate::{response::make_query_response, util::token::decode_token, validate_path};
use actix_web::{HttpRequest, HttpResponse, delete, web};
use entity::urls;
use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter};

#[delete("/{url_id}")]
pub async fn delete_url(
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
        .one(db.get_ref())
        .await;

    match url {
        Ok(Some(url)) => {
            if url.user_id.is_none() || url.user_id.clone().unwrap() != decoded.claims.sub {
                return HttpResponse::Unauthorized().json(make_query_response::<()>(
                    false,
                    None,
                    Some("You do not own this URL"),
                    None,
                ));
            }

            if let Err(e) = urls::Entity::delete_by_id(url.id).exec(db.get_ref()).await {
                log::error!("Failed to delete URL: {}", e);

                return HttpResponse::InternalServerError().json(make_query_response::<()>(
                    false,
                    None,
                    Some("Failed to delete URL"),
                    None,
                ));
            }
        }
        Ok(None) => {
            return HttpResponse::NotFound().json(make_query_response::<()>(
                false,
                None,
                Some("URL not found"),
                None,
            ));
        }
        Err(_) => {
            return HttpResponse::InternalServerError().json(make_query_response::<()>(
                false,
                None,
                Some("Internal server esrror"),
                None,
            ));
        }
    }

    HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None))
}
