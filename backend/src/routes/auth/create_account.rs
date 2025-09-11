use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{ActiveModelTrait, DatabaseConnection};
use serde::Deserialize;

use crate::{response::make_query_response, validate_body};

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
    
    let user: users::ActiveModel = users::ActiveModel {
        email: sea_orm::ActiveValue::Set(body.email.clone()),
        password: sea_orm::ActiveValue::Set(Some(hashed_password)),
        name: sea_orm::ActiveValue::Set(body.name.clone()),
        ..Default::default()
    };

    if let Err(e) = user.insert(db.get_ref()).await {
        eprintln!("Could not create user: {:?}", e);

        return HttpResponse::InternalServerError().json(make_query_response::<()>(
            false,
            None,
            Some("Could not create user"),
            None,
        ));
    }

    HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None))
}
