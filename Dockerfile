# TrustPay Rust API — repo-root Dockerfile for Railway & hosts that build from monorepo root.
# Docker Compose still uses backend/Dockerfile with context ./backend (see docker-compose.yml).

FROM rust:bookworm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/Cargo.toml backend/Cargo.toml
COPY backend/Cargo.lock backend/Cargo.lock
COPY backend/src backend/src
WORKDIR /app/backend
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/backend/target/release/trustpay-api /usr/local/bin/trustpay-api
ENV HOST=0.0.0.0
ENV PORT=8787
ENV DATABASE_PATH=/data/trustpay.sqlite
# No Docker VOLUME — Railway rejects VOLUME; add a Railway Volume mounted at /data in the dashboard for persistence.
EXPOSE 8787
WORKDIR /data
CMD ["trustpay-api"]
