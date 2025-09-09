use actix_governor::{Governor, GovernorConfigBuilder};
use actix_web::web;

pub mod auth;
pub mod health;
pub mod url;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    let health_governor = GovernorConfigBuilder::default()
        .requests_per_minute(120)
        .burst_size(10)
        .finish()
        .expect("Failed to create Governor config");

    let url_post_governor = GovernorConfigBuilder::default()
        .requests_per_hour(10)
        .finish()
        .expect("Failed to create Governor config");

    let auth_governor = GovernorConfigBuilder::default()
        .requests_per_hour(30)
        .finish()
        .expect("Failed to create Governor config");

    cfg.service(
        web::scope("/health")
            .wrap(Governor::new(&health_governor))
            .service(health::health),
    )
    .service(
        web::scope("/url").service(url::url::get_url).service(
            web::scope("")
                .wrap(Governor::new(&url_post_governor))
                .service(url::url::create_url),
        ),
    )
    .service(
        web::scope("/auth")
            .wrap(Governor::new(&auth_governor))
            .service(web::scope("/login").service(auth::login::login))
            .service(web::scope("/logout").service(auth::logout::logout))
            .service(web::scope("/me").service(auth::me::me))
            .service(web::scope("/verify").service(auth::verify::verify))
            .service(web::scope("/request-verify").service(auth::request_verify::request_verify))
            .service(web::scope("/verify-reset").service(auth::verify_reset::verify))
            .service(web::scope("/request-reset").service(auth::request_reset::request_reset))
            .service(web::scope("/reset-password").service(auth::reset_password::reset_password))
            .service(web::scope("/create-account").service(auth::create_account::create_account))
            .service(web::scope("/delete-account").service(auth::delete_account::delete_account)),
    );
}
