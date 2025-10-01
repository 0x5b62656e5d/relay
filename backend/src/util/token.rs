use crate::{config::ENV, types::typedefs::TokenClaim};
use jsonwebtoken::TokenData;

pub fn decode_token(token: String) -> Result<TokenData<TokenClaim>, jsonwebtoken::errors::Error> {
    jsonwebtoken::decode::<TokenClaim>(
        &token,
        &jsonwebtoken::DecodingKey::from_secret(ENV.jwt_secret.as_ref()),
        &jsonwebtoken::Validation::default(),
    )
}
