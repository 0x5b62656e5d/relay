use crate::{
    response::make_query_response,
    util::{
        generate_key::{generate_key, hash_sha256_key},
        send_mail::send_email,
    },
    validate_body,
};
use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct RequestVerifyBody {
    pub user_id: String,
}

#[post("")]
pub async fn request_verify(
    body: Result<web::Json<RequestVerifyBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<RequestVerifyBody> = validate_body!(body);

    let user: Option<users::Model> = users::Entity::find_by_id(body.user_id.clone())
        .one(db.get_ref())
        .await
        .unwrap();

    if let None = user {
        return HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            Some("User not found"),
            None,
        ));
    }

    let user: users::Model = user.unwrap();

    let verification_key: String = generate_key();

    let active_user: users::ActiveModel = users::ActiveModel {
        id: sea_orm::ActiveValue::Set(body.user_id.clone()),
        verification_key: sea_orm::ActiveValue::Set(Some(hash_sha256_key(&verification_key))),
        verification_key_expires: sea_orm::ActiveValue::Set(Some(
            (chrono::Utc::now() + chrono::Duration::hours(1)).naive_utc(),
        )),
        ..Default::default()
    };

    if let Err(e) = active_user.update(db.get_ref()).await {
        eprintln!("Could update user's email verification key: {:?}", e);

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Failed to update user's email verification key"),
            None,
        ));
    }

    match send_email(
        format!("{} <{}>", user.name, user.email).as_str(),
        "Verify your Relay account",
        format!(
            "<h1>Verify your Relay account</h1><p>Verify your email address with key: {}",
            verification_key
        ) //TODO: add proper link and format HTML body
        .as_str(),
    ) {
        Ok(_) => HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None)),
        Err(e) => {
            eprintln!("Could not send email: {:?}", e);

            HttpResponse::InternalServerError().json(make_query_response::<()>(
                false,
                None,
                Some("Failed to send email"),
                None,
            ))
        }
    }
}
