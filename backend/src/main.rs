use actix_web::{App, HttpServer, web};
use config::ENV;
use log::info;
use sea_orm::{Database, DatabaseConnection};

use crate::util::cleanup::start_cron_jobs;

mod config;
mod macros;
mod response;
mod routes;
mod types;
mod util;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // env_logger::init();
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    info!("Starting server on port {}", ENV.port);

    let db: DatabaseConnection = Database::connect(&ENV.db_url)
        .await
        .expect("Failed to connect to the database");

    start_cron_jobs(db.clone()).await;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .configure(routes::init_routes)
    })
    .bind(format!("0.0.0.0:{}", ENV.port))?
    .run()
    .await
}
