use anyhow::Result;
use solana_pubkey::Pubkey;
use std::str::FromStr;
use tracing_subscriber::EnvFilter;
use trustpay_api::handlers::AppState;
use trustpay_api::{app, db};

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let db_path = std::env::var("DATABASE_PATH").unwrap_or_else(|_| "trustpay.sqlite".to_string());
    let db = db::Db::connect(&db_path)?;

    let program_id_str = std::env::var("TRUSTPAY_PROGRAM_ID")
        .unwrap_or_else(|_| "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn".to_string());
    let program_id = Pubkey::from_str(program_id_str.trim())?;

    let solana_rpc = std::env::var("SOLANA_RPC_URL")
        .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());

    let openai_key = std::env::var("OPENAI_API_KEY").ok();
    let eleven_key = std::env::var("ELEVENLABS_API_KEY").ok();
    let eleven_voice_id = std::env::var("ELEVENLABS_VOICE_ID")
        .unwrap_or_else(|_| "21m00Tcm4TlvDq8ikWAM".to_string());
    let eleven_model_id = std::env::var("ELEVENLABS_MODEL_ID")
        .unwrap_or_else(|_| "eleven_multilingual_v2".to_string());

    let http = reqwest::Client::builder()
        .user_agent("trustpay-api/0.1")
        .build()?;

    let state = AppState {
        db,
        http,
        openai_key,
        eleven_key,
        eleven_voice_id,
        eleven_model_id,
        solana_rpc,
        program_id,
    };

    let app = app(state);

    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8787);
    let addr = format!("{host}:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("TrustPay API listening on http://{addr}");
    axum::serve(listener, app).await?;
    Ok(())
}
