//! TrustPay API library (used by `main` and integration tests).
pub mod db;
pub mod handlers;
pub mod risk;
pub mod solana_util;
pub mod voice;

use axum::routing::{get, post};
use axum::Router;
use handlers::AppState;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

/// HTTP router (CORS + tracing layers; same surface as production).
pub fn app(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/health", get(handlers::health))
        .route("/api/deals", get(handlers::list_deals).post(handlers::create_deal))
        .route("/api/deals/:id", get(handlers::get_deal))
        .route("/api/deals/:id/analyze", post(handlers::analyze_deal))
        .route(
            "/api/deals/:id/messages",
            get(handlers::list_messages).post(handlers::post_message),
        )
        .route(
            "/api/deals/:id/voice-contract",
            post(handlers::voice_contract),
        )
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
