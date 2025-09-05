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

    let verify_governor = GovernorConfigBuilder::default()
        .requests_per_hour(10)
        .finish()
        .expect("Failed to create Governor config");

    cfg.service(
        web::scope("/health")
            .wrap(Governor::new(&health_governor))
            .service(health::health),
    )
    .service(
        web::scope("/url").service(url::get_url).service(
            web::scope("")
                .wrap(Governor::new(&url_post_governor))
                .service(url::create_url),
        ),
    )
    .service(
        web::scope("/auth")
            .wrap(Governor::new(&verify_governor))
            .service(web::scope("/verify").service(auth::verify::verify))
            .service(web::scope("/request-verify").service(auth::request_verify::request_verify)),
    );
}
