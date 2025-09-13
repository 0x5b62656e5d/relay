use dotenv;
use std::env;
use std::sync::LazyLock;

pub struct Env {
    pub port: u16,
    pub db_url: String,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_user: String,
    pub smtp_password: String,
    pub jwt_secret: String,
}

impl Env {
    /// - Retrieves an environment variable by key
    /// - Panics if the variable is not set
    fn get_env(key: &str) -> String {
        env::var(key).unwrap_or_else(|_| {
            panic!("Environment variable {} not set", key);
        })
    }

    /// Creates a new instance of `Env` and loads environment variables
    fn new() -> Self {
        dotenv::dotenv().ok();

        Self {
            port: Self::get_env("PORT").parse().unwrap(),
            db_url: Self::get_env("DATABASE_URL"),
            smtp_host: Self::get_env("SMTP_HOST"),
            smtp_port: Self::get_env("SMTP_PORT").parse().unwrap(),
            smtp_user: Self::get_env("SMTP_USER"),
            smtp_password: Self::get_env("SMTP_PASSWORD"),
            jwt_secret: Self::get_env("JWT_SECRET"),
        }
    }
}

pub static ENV: LazyLock<Env> = LazyLock::new(Env::new);
