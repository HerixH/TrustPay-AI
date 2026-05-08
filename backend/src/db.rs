use anyhow::{Context, Result};
use rusqlite::{params, Connection, Row};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct Db(pub Arc<Mutex<Connection>>);

impl Db {
    pub fn connect(path: &str) -> Result<Self> {
        let conn = Connection::open(path).with_context(|| format!("open sqlite {path}"))?;
        conn.execute_batch(
            r"
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS deals (
                id TEXT PRIMARY KEY,
                deal_seed TEXT NOT NULL,
                buyer TEXT NOT NULL,
                seller TEXT NOT NULL,
                arbiter TEXT NOT NULL,
                amount_lamports INTEGER NOT NULL,
                program_id TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                deal_id TEXT NOT NULL,
                sender TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(deal_id) REFERENCES deals(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS risk_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                deal_id TEXT NOT NULL,
                tier TEXT NOT NULL,
                rationale TEXT NOT NULL,
                signals_json TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(deal_id) REFERENCES deals(id) ON DELETE CASCADE
            );
            ",
        )?;
        Ok(Self(Arc::new(Mutex::new(conn))))
    }
}

pub fn row_to_deal_summary(row: &Row<'_>) -> rusqlite::Result<serde_json::Value> {
    let id: String = row.get(0)?;
    let deal_seed: String = row.get(1)?;
    let buyer: String = row.get(2)?;
    let seller: String = row.get(3)?;
    let arbiter: String = row.get(4)?;
    let amount_lamports: i64 = row.get(5)?;
    let program_id: String = row.get(6)?;
    let created_at: i64 = row.get(7)?;
    Ok(serde_json::json!({
        "id": id,
        "deal_seed": deal_seed,
        "buyer": buyer,
        "seller": seller,
        "arbiter": arbiter,
        "amount_lamports": amount_lamports,
        "program_id": program_id,
        "created_at": created_at
    }))
}

pub fn fetch_last_risk(
    conn: &Connection,
    deal_id: &str,
) -> rusqlite::Result<Option<serde_json::Value>> {
    let mut stmt = conn.prepare(
        "SELECT tier, rationale, signals_json, created_at FROM risk_events WHERE deal_id = ?1 ORDER BY id DESC LIMIT 1",
    )?;
    let mut rows = stmt.query(params![deal_id])?;
    if let Some(row) = rows.next()? {
        let signals_raw: Option<String> = row.get(2)?;
        let signals_json = signals_raw
            .as_ref()
            .and_then(|s| serde_json::from_str::<serde_json::Value>(s).ok())
            .unwrap_or(serde_json::json!({}));
        Ok(Some(serde_json::json!({
            "tier": row.get::<_, String>(0)?,
            "rationale": row.get::<_, String>(1)?,
            "signals": signals_json,
            "created_at": row.get::<_, i64>(3)?,
        })))
    } else {
        Ok(None)
    }
}
