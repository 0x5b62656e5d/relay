use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{response::make_query_response, validate_body};

#[derive(Deserialize)]
pub struct CreateAccountBody {
    pub email: String,
    pub password: String,
}

#[post("")]
pub async fn create_account(
    body: Result<web::Json<CreateAccountBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<CreateAccountBody> = validate_body!(body);

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

    if body.password != user.password {
        return HttpResponse::BadRequest().json(make_query_response::<()>(
            false,
            None,
            Some("Incorrect password"),
            None,
        ));
    }

    let active_user: users::ActiveModel = users::ActiveModel {
        id: sea_orm::ActiveValue::Set(user.id),
        ..Default::default()
    };

    if let Err(e) = active_user.delete(db.get_ref()).await {
        eprintln!("Failed to delete user: {:?}", e);

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Failed to delete user"),
            None,
        ));
    }

    HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None))
}
