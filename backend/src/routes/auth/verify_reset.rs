use crate::{
    response::make_query_response,
    util::generate_key::{compare_sha256_key, hash_sha256_key},
};
use actix_web::{HttpResponse, post, web};
use entity::users;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};

#[post("/{reset_key}")]
pub async fn verify(
    reset_key: web::Path<String>,
    db: web::Data<DatabaseConnection>,
) -> HttpResponse {
    let reset_key: String = reset_key.into_inner();

    let user: Option<users::Model> = users::Entity::find()
        .filter(users::Column::ResetKey.eq(hash_sha256_key(&reset_key)))
        .one(db.get_ref())
        .await
        .unwrap();

    if user.is_none() {
        return HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            Some("Invalid verification key"),
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
    } else if user.reset_key_expires.unwrap() < chrono::Utc::now().fixed_offset() {
        return HttpResponse::BadRequest().json(make_query_response::<()>(
            false,
            None,
            Some("Verification key has expired"),
            None,
        ));
    } else if !compare_sha256_key(&reset_key, &user.reset_key.unwrap()) {
        return HttpResponse::NotFound().json(make_query_response::<()>(
            false,
            None,
            Some("Invalid verification key"),
            None,
        ));
    }

    HttpResponse::Ok().json(make_query_response::<()>(true, None, None, None))
}
