use lettre::{
    Message, SmtpTransport, Transport,
    message::{Mailbox, header::ContentType},
    transport::smtp::authentication::Credentials,
};

use crate::config::ENV;

/// Creates and configures the SMTP client
fn create_mailer() -> SmtpTransport {
    SmtpTransport::starttls_relay(&ENV.smtp_host)
        .unwrap()
        .port(ENV.smtp_port)
        .credentials(Credentials::new(
            ENV.smtp_user.clone(),
            ENV.smtp_password.clone(),
        ))
        .build()
}

/// Sends an email given the recipient, subject, and HTML body
pub fn send_email(
    to: &str,
    subject: &str,
    body: &str,
) -> Result<lettre::transport::smtp::response::Response, Box<dyn std::error::Error>> {
    let email: Message = Message::builder()
        .from("Relay <relay@pepper.fyi>".parse::<Mailbox>()?)
        .to(to.parse::<Mailbox>()?)
        .subject(subject)
        .header(ContentType::TEXT_HTML)
        .body(String::from(body))?;

    create_mailer()
        .send(&email)
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)
}
