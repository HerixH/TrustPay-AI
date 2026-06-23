use crate::{
    db::{fetch_last_risk, row_to_deal_summary, Db},
    risk, solana_util, voice,
};
use axum::extract::{Path, Query, State};
use axum::{http::StatusCode, Json};
use chrono::Utc;
use rand::RngCore;
use serde::Deserialize;
use serde_json::{json, Value};
use solana_pubkey::Pubkey;
use std::str::FromStr;
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub http: reqwest::Client,
    pub openai_key: Option<String>,
    pub eleven_key: Option<String>,
    pub eleven_voice_id: String,
    pub eleven_model_id: String,
    pub solana_rpc: String,
    pub program_id: Pubkey,
}

#[derive(Deserialize)]
pub struct CreateDeal {
    buyer: String,
    seller: String,
    arbiter: String,
    amount_lamports: u64,
}

#[derive(Deserialize)]
pub struct PostMessage {
    sender: String,
    body: String,
}

#[derive(Deserialize)]
pub struct IncludeChainQuery {
    include_chain: Option<bool>,
}

#[derive(Deserialize)]
pub struct ActivityQuery {
    limit: Option<usize>,
}

#[derive(Deserialize)]
pub struct DealId {
    pub id: String,
}

type ApiResp<T> = Result<Json<T>, (StatusCode, String)>;

fn err400(msg: impl Into<String>) -> (StatusCode, String) {
    (StatusCode::BAD_REQUEST, msg.into())
}

fn err500(msg: impl Into<String>) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, msg.into())
}

pub async fn health() -> &'static str {
    "ok"
}

fn deal_label(id: &str) -> String {
    let short: String = id
        .chars()
        .filter(|c| *c != '-')
        .take(4)
        .collect::<String>()
        .to_uppercase();
    format!("TP-{short}")
}

fn truncate_detail(text: &str, max: usize) -> String {
    let t = text.trim();
    if t.chars().count() <= max {
        return t.to_string();
    }
    let cut: String = t.chars().take(max.saturating_sub(1)).collect();
    format!("{cut}…")
}

pub async fn list_activity(
    State(state): State<AppState>,
    Query(q): Query<ActivityQuery>,
) -> ApiResp<Vec<Value>> {
    let limit = q.limit.unwrap_or(50).clamp(1, 100);
    let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;

    let mut events: Vec<Value> = Vec::new();

    {
        let mut stmt = conn
            .prepare(
                "SELECT id, amount_lamports, created_at FROM deals ORDER BY created_at DESC LIMIT ?1",
            )
            .map_err(|e| err500(format!("{e}")))?;
        let rows = stmt
            .query_map([limit as i64], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, i64>(1)?,
                    r.get::<_, i64>(2)?,
                ))
            })
            .map_err(|e| err500(format!("{e}")))?;
        for row in rows {
            let (id, amount_lamports, created_at) =
                row.map_err(|e| err500(format!("{e}")))?;
            let label = deal_label(&id);
            events.push(json!({
                "id": format!("deal:{id}"),
                "kind": "deal_created",
                "deal_id": id,
                "deal_label": label,
                "title": "User initiated a deal",
                "detail": format!("Escrow configured · Deal #{label} · {amount_lamports} lamports"),
                "tone": "good",
                "created_at": created_at,
            }));
        }
    }

    {
        let mut stmt = conn
            .prepare(
                "SELECT m.id, m.deal_id, m.sender, m.body, m.created_at
                 FROM messages m
                 ORDER BY m.created_at DESC, m.id DESC
                 LIMIT ?1",
            )
            .map_err(|e| err500(format!("{e}")))?;
        let rows = stmt
            .query_map([limit as i64], |r| {
                Ok((
                    r.get::<_, i64>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, String>(3)?,
                    r.get::<_, i64>(4)?,
                ))
            })
            .map_err(|e| err500(format!("{e}")))?;
        for row in rows {
            let (msg_id, deal_id, sender, body, created_at) =
                row.map_err(|e| err500(format!("{e}")))?;
            let label = deal_label(&deal_id);
            let hits = risk::scam_keyword_hits(&body);
            let (title, detail, tone) = if !hits.is_empty() {
                (
                    format!("{} message flagged", sender),
                    format!(
                        "Matched risky phrases: {} · Deal #{label}",
                        hits.join(", ")
                    ),
                    "warn",
                )
            } else {
                (
                    format!("New message from {sender}"),
                    format!("{} · Deal #{label}", truncate_detail(&body, 96)),
                    "neutral",
                )
            };
            events.push(json!({
                "id": format!("message:{msg_id}"),
                "kind": "message",
                "deal_id": deal_id,
                "deal_label": label,
                "title": title,
                "detail": detail,
                "tone": tone,
                "created_at": created_at,
            }));
        }
    }

    {
        let mut stmt = conn
            .prepare(
                "SELECT r.id, r.deal_id, r.tier, r.rationale, r.created_at
                 FROM risk_events r
                 INNER JOIN (
                   SELECT deal_id, MAX(id) AS max_id
                   FROM risk_events
                   GROUP BY deal_id
                 ) latest ON r.id = latest.max_id
                 WHERE r.tier != 'low'
                 ORDER BY r.created_at DESC, r.id DESC
                 LIMIT ?1",
            )
            .map_err(|e| err500(format!("{e}")))?;
        let rows = stmt
            .query_map([limit as i64], |r| {
                Ok((
                    r.get::<_, i64>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, String>(3)?,
                    r.get::<_, i64>(4)?,
                ))
            })
            .map_err(|e| err500(format!("{e}")))?;
        for row in rows {
            let (risk_id, deal_id, tier, rationale, created_at) =
                row.map_err(|e| err500(format!("{e}")))?;
            let label = deal_label(&deal_id);
            let (title, detail, tone) = match tier.as_str() {
                "high" => (
                    "AI: scam risk flagged",
                    format!(
                        "{} · auto-hold engaged · Deal #{label}",
                        truncate_detail(&rationale, 72)
                    ),
                    "warn",
                ),
                "medium" => (
                    "Funds remain protected",
                    format!(
                        "Release blocked until review / dispute path · Deal #{label}"
                    ),
                    "neutral",
                ),
                _ => (
                    "Risk scan clear",
                    format!(
                        "{} · Deal #{label}",
                        truncate_detail(&rationale, 72)
                    ),
                    "good",
                ),
            };
            events.push(json!({
                "id": format!("risk:{risk_id}"),
                "kind": "risk_analyzed",
                "deal_id": deal_id,
                "deal_label": label,
                "title": title,
                "detail": detail,
                "tone": tone,
                "tier": tier,
                "created_at": created_at,
            }));
        }
    }

    events.sort_by(|a, b| {
        let ta = a["created_at"].as_i64().unwrap_or(0);
        let tb = b["created_at"].as_i64().unwrap_or(0);
        tb.cmp(&ta).then_with(|| {
            let ia = a["id"].as_str().unwrap_or("");
            let ib = b["id"].as_str().unwrap_or("");
            ib.cmp(ia)
        })
    });
    events.truncate(limit);

    Ok(Json(events))
}

pub async fn list_deals(State(state): State<AppState>) -> ApiResp<Vec<Value>> {
    let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
    let mut stmt = conn
        .prepare("SELECT id, deal_seed, buyer, seller, arbiter, amount_lamports, program_id, created_at FROM deals ORDER BY created_at DESC")
        .map_err(|e| err500(format!("{e}")))?;
    let rows = stmt
        .query_map([], row_to_deal_summary)
        .map_err(|e| err500(format!("{e}")))?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row.map_err(|e| err500(format!("{e}")))?);
    }
    Ok(Json(out))
}

pub async fn create_deal(
    State(state): State<AppState>,
    Json(body): Json<CreateDeal>,
) -> ApiResp<Value> {
    let buyer = Pubkey::from_str(body.buyer.trim()).map_err(|e| err400(e.to_string()))?;
    let seller = Pubkey::from_str(body.seller.trim()).map_err(|e| err400(e.to_string()))?;
    let arbiter = Pubkey::from_str(body.arbiter.trim()).map_err(|e| err400(e.to_string()))?;

    let mut rng = rand::thread_rng();
    let mut deal_seed = [0u8; 8];
    rng.fill_bytes(&mut deal_seed);
    let hex_seed = deal_seed.iter().map(|b| format!("{:02x}", b)).collect::<String>();
    let id = Uuid::new_v4().to_string();

    let now = Utc::now().timestamp();
    let program_id_str = state.program_id.to_string();
    let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
    conn.execute(
        "INSERT INTO deals (id, deal_seed, buyer, seller, arbiter, amount_lamports, program_id, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        rusqlite::params![
            id,
            hex_seed.clone(),
            buyer.to_string(),
            seller.to_string(),
            arbiter.to_string(),
            body.amount_lamports as i64,
            program_id_str,
            now
        ],
    )
    .map_err(|e| err400(format!("{e}")))?;

    let seed_bytes = decode_seed_hex(&hex_seed)?;
    let (escrow_pubkey, escrow_bump) = solana_util::escrow_pda(&state.program_id, &buyer, &seller, &seed_bytes);
    let (vault_pubkey, vault_bump) = solana_util::vault_pda(&state.program_id, &escrow_pubkey);

    Ok(Json(json!({
        "id": id,
        "deal_seed_hex": hex_seed,
        "program_id": state.program_id.to_string(),
        "buyer": buyer.to_string(),
        "seller": seller.to_string(),
        "arbiter": arbiter.to_string(),
        "amount_lamports": body.amount_lamports,
        "pdas": {
            "escrow": escrow_pubkey.to_string(),
            "vault": vault_pubkey.to_string(),
            "escrow_bump": escrow_bump,
            "vault_bump": vault_bump,
        }
    })))
}

pub async fn get_deal(
    State(state): State<AppState>,
    Path(DealId { id }): Path<DealId>,
    Query(q): Query<IncludeChainQuery>,
) -> ApiResp<Value> {
    let (mut bundle, escrow_pubkey) = {
        let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
        let mut stmt = conn
        .prepare("SELECT id, deal_seed, buyer, seller, arbiter, amount_lamports, program_id, created_at FROM deals WHERE id = ?")
        .map_err(|e| err500(format!("{e}")))?;

    let deal = stmt
        .query_row([&id], row_to_deal_summary)
        .map_err(|e| err404(e))?;

    let seed_hex = deal["deal_seed"]
        .as_str()
        .ok_or_else(|| err400("missing deal_seed"))?;
    let seed_bytes = decode_seed_hex(seed_hex)?;
    let buyer = Pubkey::from_str(
        deal["buyer"]
            .as_str()
            .ok_or_else(|| err400("bad buyer"))?,
    )
    .map_err(|e| err400(format!("buyer pubkey {e}")))?;
    let seller = Pubkey::from_str(
        deal["seller"]
            .as_str()
            .ok_or_else(|| err400("bad seller"))?,
    )
    .map_err(|e| err400(format!("seller pubkey {e}")))?;

    let (escrow_pubkey, escrow_bump) =
        solana_util::escrow_pda(&state.program_id, &buyer, &seller, &seed_bytes);
    let (vault_pubkey, vault_bump) =
        solana_util::vault_pda(&state.program_id, &escrow_pubkey);

    let last_risk = fetch_last_risk(&conn, &id).map_err(|e| err500(format!("{e}")))?;

    let mut bundle = serde_json::Map::new();
    bundle.insert("deal".to_string(), deal);
    bundle.insert(
        "last_risk_score".to_string(),
        last_risk.unwrap_or(Value::Null),
    );

    let mut sol = serde_json::Map::new();
    sol.insert(
        "program_id".to_string(),
        json!(state.program_id.to_string()),
    );
    sol.insert(
        "escrow_pubkey".to_string(),
        json!(escrow_pubkey.to_string()),
    );
    sol.insert(
        "vault_pubkey".to_string(),
        json!(vault_pubkey.to_string()),
    );
    sol.insert("escrow_bump".to_string(), json!(escrow_bump));
    sol.insert("vault_bump".to_string(), json!(vault_bump));
    sol.insert(
        "explorer_escrow".to_string(),
        json!(format!(
            "https://explorer.solana.com/address/{}?cluster=devnet",
            escrow_pubkey
        )),
    );
    sol.insert(
        "explorer_vault".to_string(),
        json!(format!(
            "https://explorer.solana.com/address/{}?cluster=devnet",
            vault_pubkey
        )),
    );
    bundle.insert(
        "solana".to_string(),
        Value::Object(sol),
    );

        (bundle, escrow_pubkey)
    };

    if q.include_chain == Some(true) {
        let chain_escrow = solana_util::fetch_escrow_account_info(
            &state.http,
            &state.solana_rpc,
            &escrow_pubkey,
        )
        .await
        .map_err(|e| err500(e.to_string()))?;

        bundle.get_mut("solana").map(|sv| {
            if let serde_json::Value::Object(ref mut m) = sv {
                m.insert("chain".to_string(), chain_escrow);
            }
        });
    }

    Ok(Json(Value::Object(bundle)))
}

fn err404(e: rusqlite::Error) -> (StatusCode, String) {
    match e {
        rusqlite::Error::QueryReturnedNoRows => (StatusCode::NOT_FOUND, "deal not found".into()),
        _ => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

pub async fn list_messages(
    State(state): State<AppState>,
    Path(DealId { id }): Path<DealId>,
) -> ApiResp<Vec<Value>> {
    verify_deal(&state.db, &id)?;
    let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
    let mut stmt = conn
        .prepare("SELECT id, sender, body, created_at FROM messages WHERE deal_id = ?1 ORDER BY id ASC")
        .map_err(|e| err500(format!("{e}")))?;
    let rows = stmt
        .query_map([&id], |r| {
            Ok(json!({
                "id": r.get::<_, i64>(0)?,
                "sender": r.get::<_, String>(1)?,
                "body": r.get::<_, String>(2)?,
                "created_at": r.get::<_, i64>(3)?,
            }))
        })
        .map_err(|e| err500(format!("{e}")))?;

    let mut out = Vec::new();
    for row in rows {
        out.push(row.map_err(|e| err500(format!("{e}")))?);
    }
    Ok(Json(out))
}

pub async fn post_message(
    State(state): State<AppState>,
    Path(DealId { id }): Path<DealId>,
    Json(body): Json<PostMessage>,
) -> ApiResp<Value> {
    verify_deal(&state.db, &id)?;
    let now = Utc::now().timestamp();
    let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
    conn.execute(
        "INSERT INTO messages (deal_id, sender, body, created_at) VALUES (?1,?2,?3,?4)",
        rusqlite::params![id, body.sender, body.body, now],
    )
    .map_err(|e| err400(format!("{e}")))?;
    Ok(Json(json!({"ok": true })))
}

pub async fn analyze_deal(
    State(state): State<AppState>,
    Path(DealId { id }): Path<DealId>,
) -> ApiResp<Value> {
    verify_deal(&state.db, &id)?;
    let lines = {
        let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
        let mut stmt = conn
            .prepare("SELECT sender, body FROM messages WHERE deal_id = ?1 ORDER BY id ASC")
            .map_err(|e| err500(format!("{e}")))?;
        let rows = stmt
            .query_map([&id], |r| {
                Ok(format!("{}: {}", r.get::<_, String>(0)?, r.get::<_, String>(1)?))
            })
            .map_err(|e| err500(format!("{e}")))?;

        let mut lines = Vec::new();
        for row in rows {
            lines.push(row.map_err(|e| err500(format!("{e}")))?);
        }
        lines
    };

    let transcript = lines.join("\n");
    let score = risk::score_transcript(
        &state.http,
        state.openai_key.as_deref(),
        &transcript,
    )
    .await
    .map_err(|e| err500(e.to_string()))?;

    let tier = score["tier"].as_str().unwrap_or("medium").to_string();
    let rationale = score["rationale"].as_str().unwrap_or("").to_string();
    let signals = score["signals"].clone();
    let now = Utc::now().timestamp();
    {
        let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
        conn.execute(
            "INSERT INTO risk_events (deal_id, tier, rationale, signals_json, created_at)
         VALUES (?1,?2,?3,?4,?5)",
            rusqlite::params![
                id,
                tier.clone(),
                rationale.clone(),
                signals.to_string(),
                now
            ],
        )
        .map_err(|e| err400(format!("{e}")))?;
    }

    Ok(Json(json!({
        "tier": tier,
        "rationale": rationale,
        "signals": signals,
        "analyzed_messages": lines.len(),
    })))
}

pub async fn voice_contract(
    State(state): State<AppState>,
    Path(DealId { id }): Path<DealId>,
) -> ApiResp<Value> {
    verify_deal(&state.db, &id)?;

    let key = state.eleven_key.clone().filter(|s| !s.is_empty());

    let script = {
        let conn = state.db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
        let mut stmt = conn
            .prepare(
                "SELECT buyer, seller, arbiter, amount_lamports, deal_seed FROM deals WHERE id = ?1",
            )
            .map_err(|e| err500(format!("{e}")))?;
        let (buyer, seller, arbiter, amt, seed_hex): (String, String, String, i64, String) = stmt
            .query_row([&id], |r| {
                Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
            })
            .map_err(|e| err404(e))?;

        format!(
            "TrustPay voice confirmation. Deal identifiers {seed_hex}. \
         Buyer wallet {buyer}. Seller wallet {seller}. Arbiter wallet {arbiter}. \
         Escrow holds {amt} lamports until mutual release by both parties \
         or resolution by the designated arbiter. \
         Messaging and behavioral analysis may elevate fraud risk recommendations but on-chain escrow rules prevail."
        )
    };

    if let Some(api_key) = key {
        match voice::synthesize_contract_voice(
            &state.http,
            &api_key,
            &state.eleven_voice_id,
            &state.eleven_model_id,
            &script,
        )
        .await
        {
            Ok(audio_base64) => Ok(Json(json!({
                "mime": "audio/mpeg",
                "deal_id": id,
                "audio_base64": audio_base64,
                "script": script,
            }))),
            Err(fail) => {
                tracing::warn!(
                    http_status = fail.http_status,
                    detail = ?fail.detail_status,
                    "ElevenLabs TTS failed; returning script only"
                );
                let note = if fail.http_status == 402
                    || fail.detail_status.as_deref() == Some("payment_required")
                {
                    "ElevenLabs requires billing for text-to-speech (HTTP 402 payment_required). Add a payment method or buy credits at elevenlabs.io - your API key is fine. Script is below."
                } else {
                    "Voice audio could not be generated (invalid key, quota, or ElevenLabs outage). Script is below - add a valid ELEVENLABS_API_KEY on the server if you need MP3."
                };
                Ok(Json(json!({
                    "mime": null,
                    "deal_id": id,
                    "audio_base64": serde_json::Value::Null,
                    "script": script,
                    "note": note,
                    "elevenlabs_http_status": fail.http_status,
                    "elevenlabs_detail": fail.detail_status,
                })))
            }
        }
    } else {
        Ok(Json(json!({
            "mime": null,
            "deal_id": id,
            "audio_base64": serde_json::Value::Null,
            "script": script,
            "note": "Voice audio needs ELEVENLABS_API_KEY in backend/.env, then restart the TrustPay API (cargo run). The key is read only at startup.",
        })))
    }
}

fn verify_deal(db: &Db, id: &str) -> Result<(), (StatusCode, String)> {
    let conn = db.0.lock().map_err(|e| err500(format!("db lock {e}")))?;
    let _: i64 = conn
        .query_row("SELECT 1 FROM deals WHERE id = ?", [id], |r| r.get(0))
        .map_err(|e| err404(e))?;
    Ok(())
}

fn decode_seed_hex(hex: &str) -> Result<[u8; 8], (StatusCode, String)> {
    if hex.len() != 16 {
        return Err(err400("deal_seed must be 16 hex chars"));
    }
    let mut out = [0u8; 8];
    for i in 0..8 {
        let byte_str = &hex[i * 2..i * 2 + 2];
        let b =
            u8::from_str_radix(byte_str, 16).map_err(|_| err400("invalid deal_seed hex"))?;
        out[i] = b;
    }
    Ok(out)
}
