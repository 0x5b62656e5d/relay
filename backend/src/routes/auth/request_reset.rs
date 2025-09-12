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
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct RequestResetBody {
    pub email: String,
}

#[post("")]
pub async fn request_reset(
    body: Result<web::Json<RequestResetBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<RequestResetBody> = validate_body!(body);

    let user: Option<users::Model> = users::Entity::find()
        .filter(users::Column::Email.eq(body.email.clone()))
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

    let reset_key: String = generate_key();

    let active_user: users::ActiveModel = users::ActiveModel {
        id: Set(user.id.clone()),
        reset_key: Set(Some(hash_sha256_key(&reset_key))),
        reset_key_expires: Set(Some(
            (chrono::Utc::now() + chrono::Duration::hours(1)).naive_utc(),
        )),
        ..Default::default()
    };

    if let Err(e) = active_user.update(db.get_ref()).await {
        eprintln!("Couldn't not update user's reset verification key: {:?}", e);

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Failed to update user's reset verification key"),
            None,
        ));
    }

    match send_email(
        format!("{} <{}>", user.name, user.email).as_str(),
        "Reset your Relay account password",
        format!(
            "<h1>Reset your Relay account password</h1><p>Reset your password with key: {}",
            reset_key
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
