use anyhow::{anyhow, Result};
use reqwest::Client;
use serde_json::json;

pub const SCAM_KEYWORDS: &[&str] = &[
    "pay outside",
    "whatsapp only",
    "telegram only",
    "gift card",
    "send first",
    "trust me bro",
    "bank transfer first",
    "off platform",
    "fake",
    "urgent payment",
];

pub fn scam_keyword_hits(text: &str) -> Vec<&'static str> {
    let lowered = text.to_lowercase();
    SCAM_KEYWORDS
        .iter()
        .copied()
        .filter(|k| lowered.contains(k))
        .collect()
}

pub async fn score_transcript(
    http: &Client,
    openai_key: Option<&str>,
    transcript: &str,
) -> Result<serde_json::Value> {
    let lowered = transcript.to_lowercase();
    let mut hits: Vec<&str> = Vec::new();
    for k in SCAM_KEYWORDS {
        if lowered.contains(k) {
            hits.push(k);
        }
    }

    if let Some(key) = openai_key.filter(|k| !k.is_empty()) {
        let sys = format!(
            "You are TrustPay fraud analysis. Output strict JSON object with keys: tier (\"low\"|\"medium\"|\"high\"), rationale (string), signals (object with keywords array of strings).\nConversation:\n'''{}'''",
            transcript.replace("```", "").chars().take(12000).collect::<String>()
        );
        let body = json!({
            "model": "gpt-4o-mini",
            "messages": [{"role":"user","content": sys}],
            "response_format": {"type":"json_object"},
            "temperature": 0.2
        });
        let res = http
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {key}"))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if res.status().is_success() {
            let v: serde_json::Value = res.json().await?;
            let txt = v["choices"][0]["message"]["content"]
                .as_str()
                .ok_or_else(|| anyhow!("openai: missing message content"))?;
            let parsed: serde_json::Value = serde_json::from_str(txt)?;
            return Ok(parsed);
        }
        tracing::warn!(status=?res.status(), "OpenAI scoring failed — using heuristic fallback");
    }

    let tier = if !hits.is_empty() {
        "high"
    } else if lowered.contains("pay") && lowered.contains("later") {
        "medium"
    } else {
        "low"
    };

    Ok(json!({
        "tier": tier,
        "rationale": if !hits.is_empty() {
            format!("Heuristic: matched risky phrases: {}", hits.join(", "))
        } else {
            "Heuristic: no known scam phrase matches in this transcript.".to_string()
        },
        "signals": { "keywords": hits }
    }))
}

#[cfg(test)]
mod tests {
    use super::score_transcript;
    use reqwest::Client;

    #[tokio::test]
    async fn heuristic_flags_scam_keywords() {
        let http = Client::new();
        let v = score_transcript(&http, None, "please pay outside the app with gift cards")
            .await
            .unwrap();
        assert_eq!(v["tier"], "high");
    }

    #[tokio::test]
    async fn heuristic_low_clean_chat() {
        let http = Client::new();
        let v = score_transcript(&http, None, "thanks, I will ship tomorrow with tracking.")
            .await
            .unwrap();
        assert_eq!(v["tier"], "low");
    }
}
