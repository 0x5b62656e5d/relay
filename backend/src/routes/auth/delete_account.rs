use crate::{response::make_query_response, validate_body};
use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct DeleteAccountBody {
    pub email: String,
    pub password: String,
}

#[post("")]
pub async fn delete_account(
    body: Result<web::Json<DeleteAccountBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<DeleteAccountBody> = validate_body!(body);

    let user: Option<users::Model> = users::Entity::find()
        .filter(users::Column::Email.eq(&body.email))
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

    let v: bool = bcrypt::verify(
        &body.password,
        &user.password.as_ref().unwrap(),
    )
    .unwrap_or(false);

    if !v {
        return HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            Some("Incorrect password"),
            None,
        ));
    }

    let active_user: users::ActiveModel = users::ActiveModel {
        id: Set(user.id),
        ..Default::default()
    };

    if let Err(e) = active_user.delete(db.get_ref()).await {
        log::error!("Failed to delete user: {:?}", e);

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Failed to delete user"),
            None,
        ));
    }

    HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None))
}
