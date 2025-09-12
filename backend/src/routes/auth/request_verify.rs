use crate::{
    response::make_query_response,
    util::{
        generate_key::{generate_key, hash_sha256_key},
        send_mail::send_email,
    },
};
use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, Set};

#[post("/{user_id}")]
pub async fn request_verify(
    user_id: web::Path<String>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let user: Option<users::Model> = users::Entity::find_by_id(user_id.into_inner())
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

    if user.banned {
        return HttpResponse::BadRequest().json(make_query_response::<()>(
            false,
            None,
            Some("User is banned"),
            None,
        ));
    } else if user.verified {
        return HttpResponse::BadRequest().json(make_query_response::<()>(
            false,
            None,
            Some("User is already verified"),
            None,
        ));
    }

    let verification_key: String = generate_key();

    let active_user: users::ActiveModel = users::ActiveModel {
        id: Set(user.id.clone()),
        verification_key: Set(Some(hash_sha256_key(&verification_key))),
        verification_key_expires: Set(Some(
            (chrono::Utc::now() + chrono::Duration::hours(1)).naive_utc(),
        )),
        ..Default::default()
    };

    if let Err(e) = active_user.update(db.get_ref()).await {
        log::error!("Could not update user: {:?}", e);

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Could not update user"),
            None,
        ));
    }

    match send_email(
        format!("{} <{}>", user.name.clone(), user.email.clone()).as_str(),
        "Verify your Relay account",
        format!(
            "<h1>Verify your Relay account</h1><p>Verify your email address with key: {}</p><br><p>If this key is expired, request one <a href=\"https://relay.pepper.fyi/request-verify/{}\">here</a>.</p>",
            verification_key,
            user.id.clone()
        ) //TODO: add proper link and format HTML body
        .as_str(),
    ) {
        Ok(_) => HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None)),
        Err(e) => {
            log::error!("Could not send email: {:?}", e);

            HttpResponse::InternalServerError().json(make_query_response::<()>(
                false,
                None,
                Some("Failed to send email"),
                None,
            ))
        }
    }
}
