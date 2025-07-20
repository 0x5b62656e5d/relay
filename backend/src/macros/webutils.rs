#[macro_export]
/// Validates the JSON body of a request
macro_rules! validate_body {
    ($body:expr) => {
        match $body {
            Ok(b) => b,
            Err(err) => {
                log::error!("Failed to parse body: {}", err);

                return HttpResponse::BadRequest().json(
                    crate::response::make_query_response::<()>(
                        false,
                        None,
                        Some("Invalid body format"),
                        None,
                    ),
                );
            }
        }
    };
}

#[macro_export]
/// Validates the path parameter of a request
macro_rules! validate_path {
    ($path:expr, $err_msg:expr) => {
        match $path {
            Ok(p) => p,
            Err(_) => {
                return HttpResponse::BadRequest().json(
                    crate::response::make_query_response::<()>(false, None, Some($err_msg), None),
                );
            }
        }
    };
}
