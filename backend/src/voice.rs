use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde_json::json;

pub async fn synthesize_contract_voice(
    http: &Client,
    api_key: &str,
    voice_id: &str,
    script: &str,
) -> Result<String> {
    let url = format!("https://api.elevenlabs.io/v1/text-to-speech/{voice_id}");
    let body = json!({
        "text": script,
        "model_id": "eleven_multilingual_v2",
    });
    let res = http
        .post(&url)
        .header("xi-api-key", api_key)
        .header("Content-Type", "application/json")
        .header("Accept", "audio/mpeg")
        .json(&body)
        .send()
        .await?;

    if !res.status().is_success() {
        let status = res.status();
        let t = res.text().await.unwrap_or_default();
        return Err(anyhow!("elevenlabs: HTTP {status} — {t}"));
    }
    let bytes = res.bytes().await?;
    Ok(STANDARD.encode(bytes))
}
