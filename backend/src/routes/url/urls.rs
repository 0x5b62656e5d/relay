use std::str::FromStr;

use crate::{
    response::make_query_response,
    util::{generate_nanoid::generate_nanoid, token::decode_token},
    validate_body, validate_path,
};
use actix_web::{
    HttpRequest, HttpResponse, get,
    http::header::{HeaderMap, HeaderValue},
    post, web,
};
use chrono::Utc;
use codes_iso_3166::part_1::CountryCode;
use entity::{clicks, urls};
use regex::Regex;
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, DatabaseConnection, DbErr, EntityTrait, FromQueryResult,
    QuerySelect,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct UrlCreateBody {
    pub url: String,
}

#[derive(Debug, FromQueryResult, Serialize)]
struct UrlQueryResult {
    id: String,
    url: String,
    clicks: i32,
}

#[get("/{url_id}")]
pub async fn get_url(
    url_id: Result<web::Path<String>, actix_web::error::Error>,
    req: HttpRequest,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let url_id: web::Path<String> = validate_path!(url_id, "Invalid URL ID");
    let headers: &HeaderMap = req.headers();

    let url: Result<Option<UrlQueryResult>, DbErr> = urls::Entity::find_by_id(url_id.into_inner())
        .select_only()
        .columns([urls::Column::Id, urls::Column::Url, urls::Column::Clicks])
        .into_model::<UrlQueryResult>()
        .one(db.get_ref())
        .await;

    match url {
        Ok(Some(url)) => {
            let active_url: urls::ActiveModel = urls::ActiveModel {
                id: Set(url.id.clone()),
                clicks: Set(url.clicks + 1),
                last_clicked: Set(Some(Utc::now().fixed_offset())),
                ..Default::default()
            };

            if let Err(e) = active_url.update(db.get_ref()).await {
                log::error!("Failed to update URL clicks: {}", e);
            }

            let country: Result<CountryCode, codes_iso_3166::CountryCodeError> =
                CountryCode::from_str(
                    headers
                        .get("CF-IPCountry")
                        .unwrap_or_else(|| {
                            static HEADER: HeaderValue = HeaderValue::from_static("Unknown");
                            &HEADER
                        })
                        .to_str()
                        .unwrap_or("Unknown"),
                );

            let country_name: String = match country {
                Ok(c) => c.short_name().split(" (").collect::<Vec<&str>>()[0].to_string(),
                Err(_) => "Unknown".to_string(),
            };

            let user_agent: String = {
                let ua: String = headers
                    .get("User-Agent")
                    .unwrap()
                    .to_str()
                    .unwrap_or("Unknown")
                    .to_string();

                if ua.is_empty() {
                    "Unknown".to_string()
                } else {
                    ua
                }
            };

            let regex: Regex = Regex::new(r"bot|crawler|spider|crawling").unwrap();

            let active_click: clicks::ActiveModel = clicks::ActiveModel {
                id: Set(cuid2::create_id()),
                url_id: Set(url.id.clone()),
                clicked_at: Set(Utc::now().fixed_offset()),
                country: Set(Some(country_name)),
                user_agent: Set(Some(user_agent.clone())),
                is_bot: Set(regex.is_match(&user_agent.to_lowercase())),
            };

            if let Err(e) = active_click.insert(db.get_ref()).await {
                log::error!("Failed to insert click record: {}", e);
            }

            HttpResponse::Ok().json(make_query_response(true, Some(&url.url), None, None))
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
            Some("Error fetching URL"),
            None,
        )),
    }
}

#[post("")]
pub async fn create_url(
    body: Result<web::Json<UrlCreateBody>, actix_web::error::Error>,
    req: HttpRequest,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<UrlCreateBody> = validate_body!(body);

    let token = req.cookie("__Host-access");

    loop {
        let id: String = generate_nanoid();

        let new_url: urls::ActiveModel = match token.clone() {
            Some(t) if t.value().is_empty() => urls::ActiveModel {
                id: Set(id.clone()),
                url: Set(body.url.clone()),
                clicks: Set(0),
                created_at: Set(Utc::now().fixed_offset()),
                comments: Set(None),
                user_id: Set(None),
                ..Default::default()
            },
            Some(t) => {
                let decoded = decode_token(t.value().to_string());

                urls::ActiveModel {
                    id: Set(id.clone()),
                    url: Set(body.url.clone()),
                    clicks: Set(0),
                    created_at: Set(Utc::now().fixed_offset()),
                    comments: Set(None),
                    user_id: Set(Some(decoded.unwrap().claims.sub)),
                    ..Default::default()
                }
            }
            None => urls::ActiveModel {
                id: Set(id.clone()),
                url: Set(body.url.clone()),
                clicks: Set(0),
                created_at: Set(Utc::now().fixed_offset()),
                comments: Set(None),
                user_id: Set(None),
                ..Default::default()
            },
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
