use rand::{RngCore, rng};
use sha2::{Digest, Sha256};

/// Generates a random 32-byte key
/// # Returns
/// A hex-encoded string of the random key
pub fn generate_key() -> String {
    let mut buffer = [0u8; 32];
    rng().fill_bytes(&mut buffer);
    hex::encode(buffer)
}

/// Hashes a key using SHA-256
/// # Arguments
/// * `key` - The key to hash
/// # Returns
/// A -encoded string of the hashed key
pub fn hash_sha256_key(key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(key);
    hasher.finalize().iter().map(|b| format!("{:02x}", b)).collect()
}

/// Compares a key to a hashed key
/// # Arguments
/// * `key` - The key to compare
/// * `hashed_key` - The hashed key to compare to
/// # Returns
/// `true` if the given key matches the hashed key, `false` otherwise
pub fn compare_sha256_key(key: &str, hashed_key: &str) -> bool {
    hash_sha256_key(key) == hashed_key
}
