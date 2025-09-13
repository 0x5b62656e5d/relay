use crate::{response::make_query_response, util::token::decode_token};
use actix_web::{HttpRequest, HttpResponse, post, web};
use entity::users;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use serde::Serialize;

#[derive(Serialize)]
pub struct MeResponse {
    pub id: String,
    pub email: String,
    pub name: String,
}

#[post("")]
pub async fn me(req: HttpRequest, db: web::Data<DatabaseConnection>) -> HttpResponse {
    let token = match req.cookie("__Host-access") {
        Some(c) if c.value().is_empty() => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                Some("Missing token cookie"),
                None,
            ));
        }
        Some(c) => c.value().to_string(),
        None => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                Some("Missing token cookie"),
                None,
            ));
        }
    };

    let decoded = match decode_token(token) {
        Ok(t) => t,
        Err(_) => {
            return HttpResponse::Unauthorized().json(make_query_response::<()>(
                false,
                None,
                Some("Invalid token"),
                None,
            ));
        }
    };

    if decoded.claims.exp < chrono::Utc::now().timestamp() {
        return HttpResponse::Unauthorized().json(make_query_response::<()>(
            false,
            None,
            Some("Token expired"),
            None,
        ));
    }

    let user: Option<users::Model> = users::Entity::find()
        .filter(users::Column::Id.eq(decoded.claims.sub))
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

    let res: MeResponse = MeResponse {
        id: user.id,
        email: user.email,
        name: user.name,
    };

    HttpResponse::Ok().json(make_query_response::<MeResponse>(
        true,
        Some(&res),
        None,
        None,
    ))
}
