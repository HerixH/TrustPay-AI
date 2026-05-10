use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde_json::{json, Value};

/// Non-success from ElevenLabs text-to-speech (safe to surface to clients).
#[derive(Debug, Clone)]
pub struct ElevenLabsTtsFailure {
    pub http_status: u16,
    /// JSON `detail.status` when present, e.g. `invalid_api_key`, `quota_exceeded`.
    pub detail_status: Option<String>,
}

fn parse_detail_status(body: &str) -> Option<String> {
    let v: Value = serde_json::from_str(body).ok()?;
    v.get("detail")?
        .get("status")?
        .as_str()
        .map(str::to_owned)
}

pub async fn synthesize_contract_voice(
    http: &Client,
    api_key: &str,
    voice_id: &str,
    model_id: &str,
    script: &str,
) -> Result<String, ElevenLabsTtsFailure> {
    let url = format!("https://api.elevenlabs.io/v1/text-to-speech/{voice_id}");
    let body = json!({
        "text": script,
        "model_id": model_id,
    });
    let res = http
        .post(&url)
        .header("xi-api-key", api_key)
        .header("Content-Type", "application/json")
        .header("Accept", "audio/mpeg")
        .json(&body)
        .send()
        .await
        .map_err(|e| ElevenLabsTtsFailure {
            http_status: 0,
            detail_status: Some(format!("request_error:{e}")),
        })?;

    if !res.status().is_success() {
        let http_status = res.status().as_u16();
        let t = res.text().await.unwrap_or_default();
        let detail_status = parse_detail_status(&t);
        return Err(ElevenLabsTtsFailure {
            http_status,
            detail_status,
        });
    }
    let bytes = res.bytes().await.map_err(|e| ElevenLabsTtsFailure {
        http_status: 0,
        detail_status: Some(format!("body_read:{e}")),
    })?;
    Ok(STANDARD.encode(bytes))
}
