use actix_governor::{Governor, GovernorConfigBuilder};
use actix_web::web;

pub mod auth;
pub mod health;
pub mod url;
pub mod urls;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    let health_governor = GovernorConfigBuilder::default()
        .requests_per_minute(10)
        .burst_size(10)
        .finish()
        .expect("Failed to create Governor config");

    let url_get_governor = GovernorConfigBuilder::default()
        .requests_per_minute(60)
        .finish()
        .expect("Failed to create Governor config");

    let url_create_governor = GovernorConfigBuilder::default()
        .requests_per_hour(30)
        .finish()
        .expect("Failed to create Governor config");

    let me_governor = GovernorConfigBuilder::default()
        .requests_per_minute(60)
        .burst_size(30)
        .finish()
        .expect("Failed to create Governor config");

    let login_governor = GovernorConfigBuilder::default()
        .requests_per_hour(15)
        .burst_size(10)
        .finish()
        .expect("Failed to create Governor config");

    let account_management_governor = GovernorConfigBuilder::default()
        .requests_per_hour(30)
        .burst_size(10)
        .finish()
        .expect("Failed to create Governor config");

    cfg.service(
        web::scope("/health")
            .wrap(Governor::new(&health_governor))
            .service(health::health),
    );

    cfg.service(
        web::scope("/url")
            .service(
                web::scope("/create")
                    .wrap(Governor::new(&url_create_governor))
                    .service(url::url::create_url),
            )
            .service(
                web::scope("/link")
                    .wrap(Governor::new(&url_get_governor))
                    .service(url::url::get_url),
            )
            .service(
                web::scope("/list")
                    .wrap(Governor::new(&url_get_governor))
                    .service(urls::list::list_url),
            )
            .service(
                web::scope("/data")
                    .wrap(Governor::new(&url_get_governor))
                    .service(urls::url::get_url_data),
            ),
    );

    cfg.service(
        web::scope("/auth")
            .service(
                web::scope("/me")
                    .wrap(Governor::new(&me_governor))
                    .service(auth::me::me),
            )
            .service(
                web::scope("/login")
                    .wrap(Governor::new(&login_governor))
                    .service(auth::login::login),
            )
            .service(
                web::scope("/logout")
                    .wrap(Governor::new(&login_governor))
                    .service(auth::logout::logout),
            )
            .service(
                web::scope("/verify")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::verify::verify),
            )
            .service(
                web::scope("/verify-reset")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::verify_reset::verify),
            )
            .service(
                web::scope("/request-reset")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::request_reset::request_reset),
            )
            .service(
                web::scope("/request-verify")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::request_verify::request_verify),
            )
            .service(
                web::scope("/reset-password")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::reset_password::reset_password),
            )
            .service(
                web::scope("/create-account")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::create_account::create_account),
            )
            .service(
                web::scope("/delete-account")
                    .wrap(Governor::new(&account_management_governor))
                    .service(auth::delete_account::delete_account),
            ),
    );
}
