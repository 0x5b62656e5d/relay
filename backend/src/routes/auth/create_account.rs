use crate::{
    response::make_query_response,
    util::{
        generate_key::{generate_key, hash_sha256_key},
        send_mail::send_email,
    },
    validate_body,
};
use actix_web::{HttpResponse, post, web};
use cuid2;
use entity::users;
use sea_orm::{ActiveModelTrait, DatabaseConnection};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateAccountBody {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[post("")]
pub async fn create_account(
    body: Result<web::Json<CreateAccountBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<CreateAccountBody> = validate_body!(body);

    let hashed_password: String = bcrypt::hash(&body.password, bcrypt::DEFAULT_COST).unwrap();

    let verification_key: String = generate_key();

    let user: users::ActiveModel = users::ActiveModel {
        id: sea_orm::ActiveValue::Set(cuid2::create_id()),
        email: sea_orm::ActiveValue::Set(body.email.clone()),
        password: sea_orm::ActiveValue::Set(Some(hashed_password)),
        name: sea_orm::ActiveValue::Set(body.name.clone()),
        verification_key: sea_orm::ActiveValue::Set(Some(hash_sha256_key(&verification_key))),
        verification_key_expires: sea_orm::ActiveValue::Set(Some(
            (chrono::Utc::now() + chrono::Duration::hours(1)).naive_utc(),
        )),
        ..Default::default()
    };

    if let Err(e) = user.insert(db.get_ref()).await {
        if e.to_string().contains("duplicate key value") {
            return HttpResponse::Conflict().json(make_query_response::<()>(
                false,
                None,
                Some("Account already exists"),
                None,
            ));
        }

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Could not create user"),
            None,
        ));
    }

    match send_email(
        format!("{} <{}>", body.name.clone(), body.email.clone()).as_str(),
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
