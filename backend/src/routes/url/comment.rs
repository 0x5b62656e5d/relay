use crate::{
    response::make_query_response, util::token::decode_token, validate_body, validate_path,
};
use actix_web::{HttpRequest, HttpResponse, patch, web};
use entity::urls;
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, DbErr, EntityTrait,
    QueryFilter,
};
use serde::Deserialize;

#[derive(Deserialize)]
struct CommentBody {
    pub comment: String,
}

#[patch("/{url_id}")]
pub async fn update_comment(
    url_id: Result<web::Path<String>, actix_web::error::Error>,
    body: Result<web::Json<CommentBody>, actix_web::error::Error>,
    req: HttpRequest,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<CommentBody> = validate_body!(body);
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
        .one(db.get_ref())
        .await;

    match url {
        Ok(Some(url)) => {
            if url.user_id.is_none() || url.user_id.clone().unwrap() != decoded.claims.sub {
                return HttpResponse::Unauthorized().json(make_query_response::<()>(
                    false,
                    None,
                    None,
                    Some("You do not own this URL"),
                ));
            }

            let active_url: urls::ActiveModel = urls::ActiveModel {
                id: Set(url.id.clone()),
                comments: Set(Some(body.comment.clone())),
                ..Default::default()
            };

            if let Err(e) = active_url.update(db.get_ref()).await {
                log::error!("Failed to update URL comment: {}", e);

                return HttpResponse::InternalServerError().json(make_query_response::<()>(
                    false,
                    None,
                    None,
                    Some("Failed to save comment"),
                ));
            }
        }
        Ok(None) => {
            return HttpResponse::NotFound().json(make_query_response::<()>(
                false,
                None,
                None,
                Some("URL not found"),
            ));
        }
        Err(_) => {
            return HttpResponse::InternalServerError().json(make_query_response::<()>(
                false,
                None,
                None,
                Some("Internal server esrror"),
            ));
        }
    }

    HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None))
}
