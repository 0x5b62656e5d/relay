use crate::{config::ENV, response::make_query_response, validate_body};
use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginBody {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct TokenClaim {
    pub sub: String,
    pub iat: i64,
    pub exp: i64,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
}

#[post("")]
pub async fn login(
    body: Result<web::Json<LoginBody>, actix_web::error::Error>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let body: web::Json<LoginBody> = validate_body!(body);

    let user: Option<users::Model> = users::Entity::find()
        .filter(users::Column::Email.eq(body.email.clone()))
        .one(db.get_ref())
        .await
        .unwrap();

    if user.is_none() {
        return HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            None,
            Some("User not found"),
        ));
    }

    let v: bool = bcrypt::verify(
        &body.password,
        &user.as_ref().unwrap().password.as_ref().unwrap(),
    )
    .unwrap_or(false);

    if !v {
        return HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            None,
            Some("Incorrect email or password"),
        ));
    }

    if !user.as_ref().unwrap().verified {
        return HttpResponse::Forbidden().json(make_query_response::<()>(
            false,
            None,
            None,
            Some("User account not verified"),
        ));
    }

    let claim: TokenClaim = TokenClaim {
        sub: user.as_ref().unwrap().id.clone(),
        iat: chrono::Utc::now().timestamp(),
        exp: (chrono::Utc::now() + chrono::Duration::days(7)).timestamp(),
    };

    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claim,
        &jsonwebtoken::EncodingKey::from_secret(ENV.jwt_secret.as_ref()),
    );

    HttpResponse::Ok()
        .insert_header((
            "Set-Cookie",
            format!(
                "__Host-access={}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age={}",
                token.as_ref().unwrap(),
                7 * 24 * 60 * 60
            ),
        ))
        .json(make_query_response::<LoginResponse>(
            true,
            Some(&LoginResponse {
                token: token.unwrap(),
            }),
            None,
            None,
        ))
}
