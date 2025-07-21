FROM rust:latest AS builder
WORKDIR /app
COPY . .
RUN cargo build --release
RUN cargo build --release --package migration --bin migration

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y libssl-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/backend .
COPY --from=builder /app/target/release/migration .
CMD ["sh", "-c", "./migration up && ./backend"]