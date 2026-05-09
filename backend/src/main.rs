use anyhow::Result;
use solana_pubkey::Pubkey;
use std::path::Path;
use std::str::FromStr;
use tracing_subscriber::EnvFilter;
use trustpay_api::handlers::AppState;
use trustpay_api::{app, db};

/// Load `.env` from the backend crate directory so keys work even when `cwd` is the repo root.
fn load_env_file() {
    let manifest_env = Path::new(env!("CARGO_MANIFEST_DIR")).join(".env");
    if dotenvy::from_path(&manifest_env).is_ok() {
        return;
    }
    let _ = dotenvy::dotenv();
}

/** Trim + strip accidental quotes; empty means None. */
fn env_secret(key: &str) -> Option<String> {
    let raw = std::env::var(key).ok()?;
    let t = raw.trim();
    if t.is_empty() {
        return None;
    }
    let u = if t.len() >= 2 && t.starts_with('"') && t.ends_with('"') {
        t[1..t.len() - 1].trim().to_string()
    } else {
        t.to_string()
    };
    if u.is_empty() { None } else { Some(u) }
}

#[tokio::main]
async fn main() -> Result<()> {
    load_env_file();
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

    let openai_key = env_secret("OPENAI_API_KEY");
    let eleven_key = env_secret("ELEVENLABS_API_KEY");
    let eleven_voice_id = std::env::var("ELEVENLABS_VOICE_ID")
        .unwrap_or_else(|_| "21m00Tcm4TlvDq8ikWAM".to_string());
    let eleven_model_id = std::env::var("ELEVENLABS_MODEL_ID")
        .unwrap_or_else(|_| "eleven_multilingual_v2".to_string());

    let http = reqwest::Client::builder()
        .user_agent("trustpay-api/0.1")
        .build()?;

    let openai_configured = openai_key.is_some();
    let elevenlabs_configured = eleven_key.is_some();

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

    tracing::info!(
        openai_configured,
        elevenlabs_configured,
        "optional API keys loaded from env"
    );
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
