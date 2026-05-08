# Build API on Linux (avoids Windows MSVC / MinGW linker issues).
FROM rust:bookworm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/trustpay-api /usr/local/bin/trustpay-api
ENV HOST=0.0.0.0
ENV PORT=8787
ENV DATABASE_PATH=/data/trustpay.sqlite
VOLUME ["/data"]
EXPOSE 8787
WORKDIR /data
CMD ["trustpay-api"]
