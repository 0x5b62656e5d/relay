use crate::util::generate_nanoid::generate_nanoid;
use crate::validate_body;
use crate::{response::make_query_response, validate_path};
use actix_web::{HttpResponse, get, post, web};
use chrono::Utc;
use entity::urls;
use sea_orm::{
    ActiveModelTrait, DatabaseConnection, DbErr, EntityTrait, FromQueryResult, QuerySelect,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct UrlCreateBody {
    pub url: String,
}

#[derive(Debug, FromQueryResult, Serialize)]
struct UrlQueryResult {
    url: String,
}

#[get("/{url_id}")]
pub async fn get_url(
    url_id: Result<web::Path<String>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let url_id: web::Path<String> = validate_path!(url_id, "Invalid URL ID");

    let url: Option<UrlQueryResult> = urls::Entity::find_by_id(url_id.into_inner())
        .select_only()
        .column(urls::Column::Url)
        .into_model::<UrlQueryResult>()
        .one(db.get_ref())
        .await
        .unwrap_or(None);

    if let Some(url) = url {
        HttpResponse::Ok().json(make_query_response(true, Some(&url), None, None))
    } else {
        HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            Some("URL not found"),
            None,
        ))
    }
}

#[post("")]
pub async fn create_url(
    body: Result<web::Json<UrlCreateBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<UrlCreateBody> = validate_body!(body);

    loop {
        let id: String = generate_nanoid();

        let new_url: urls::ActiveModel = urls::ActiveModel {
            id: sea_orm::ActiveValue::Set(id.clone()),
            url: sea_orm::ActiveValue::Set(body.url.clone()),
            created_at: sea_orm::ActiveValue::Set(Utc::now().naive_utc()),
        };

        match new_url.insert(db.get_ref()).await {
            Ok(_) => {
                break HttpResponse::Created().json(make_query_response(
                    true,
                    Some(&id),
                    None,
                    None,
                ));
            }
            Err(DbErr::Query(err)) => {
                if err
                    .to_string()
                    .contains("duplicate key value violates unique constraint \"urls_pkey\"")
                {
                    continue;
                }

                break HttpResponse::InternalServerError().json(make_query_response::<()>(
                    false,
                    None,
                    Some("Failed to create URL"),
                    None,
                ));
            }
            Err(e) => {
                log::error!("Failed to create URL: {}", e);

                break HttpResponse::InternalServerError().json(make_query_response::<()>(
                    false,
                    None,
                    Some("Failed to create URL"),
                    None,
                ));
            }
        }
    }
}
