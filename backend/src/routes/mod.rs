use actix_governor::{Governor, GovernorConfigBuilder};
use actix_web::web;

// pub mod bans;
pub mod health;
// pub mod kicks;
// pub mod mutes;
// pub mod standard_logs;
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

    cfg.service(
        web::scope("/health")
            .wrap(Governor::new(&health_governor))
            .service(health::health),
    )
    .service(
        web::scope("/url")
            .service(url::get_url)
            .service(
                web::scope("")
                    .wrap(Governor::new(&url_post_governor))
                    .service(url::create_url),
            )
    )
    ;
    // .service(
    //     web::scope("/mutes")
    //         .wrap(Governor::new(&governor))
    //         .service(mutes::get_mute_logs)
    //         .service(mutes::get_mute_logs_by_user)
    //         .service(mutes::create_mute_log),
    // )
    // .service(
    //     web::scope("/kicks")
    //         .wrap(Governor::new(&governor))
    //         .service(kicks::get_kick_logs)
    //         .service(kicks::get_kick_logs_by_user)
    //         .service(kicks::create_kick_log),
    // )
    // .service(
    //     web::scope("/bans")
    //         .wrap(Governor::new(&governor))
    //         .service(bans::get_ban_logs)
    //         .service(bans::get_ban_logs_by_user)
    //         .service(bans::create_ban_log),
    // )
    // .service(
    //     web::scope("/standard_logs")
    //         .wrap(Governor::new(&governor))
    //         .service(standard_logs::get_standard_logs)
    //         // .service(standard_logs::get_standard_logs_by_user)
    //         .service(standard_logs::create_standard_log),
    // );
}
