//! Solana helpers: PDA derivation and lightweight JSON-RPC (no `solana-client`).
use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde_json::json;
use solana_pubkey::Pubkey;

pub fn escrow_pda(
    program_id: &Pubkey,
    buyer: &Pubkey,
    seller: &Pubkey,
    deal_seed: &[u8; 8],
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            b"escrow".as_ref(),
            buyer.as_ref(),
            seller.as_ref(),
            deal_seed.as_ref(),
        ],
        program_id,
    )
}

pub fn vault_pda(program_id: &Pubkey, escrow: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"vault".as_ref(), escrow.as_ref()], program_id)
}

fn status_label(status: u8) -> &'static str {
    match status {
        0 => "pending",
        1 => "funded",
        2 => "released",
        3 => "disputed",
        _ => "unknown",
    }
}

/// Raw on-chain `EscrowState` after Anchor 8-byte account discriminator.
pub fn parse_escrow_account(data: &[u8]) -> Option<serde_json::Value> {
    if data.len() < 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 {
        return None;
    }
    let d = &data[8..];
    let buyer = Pubkey::new_from_array(d[0..32].try_into().ok()?);
    let seller = Pubkey::new_from_array(d[32..64].try_into().ok()?);
    let arbiter = Pubkey::new_from_array(d[64..96].try_into().ok()?);
    let amount = u64::from_le_bytes(d[96..104].try_into().ok()?);
    let deal_seed_arr: [u8; 8] = d[104..112].try_into().ok()?;
    let bump_escrow = d[112];
    let bump_vault = d[113];
    let status = d[114];
    Some(json!({
        "buyer": buyer.to_string(),
        "seller": seller.to_string(),
        "arbiter": arbiter.to_string(),
        "amount_lamports": amount,
        "deal_seed_hex": hex::deal_seed_hex(&deal_seed_arr),
        "bump_escrow": bump_escrow,
        "bump_vault": bump_vault,
        "status": status_label(status),
        "status_raw": status,
    }))
}

mod hex {
    pub fn deal_seed_hex(seed: &[u8; 8]) -> String {
        seed.iter().map(|b| format!("{b:02x}")).collect()
    }
}

fn decode_rpc_account_bytes(data_field: &serde_json::Value) -> Result<Vec<u8>> {
    if let Some(arr) = data_field.as_array() {
        if let Some(s) = arr.first().and_then(|x| x.as_str()) {
            return STANDARD
                .decode(s)
                .context("base64-decode account data");
        }
    }
    anyhow::bail!("unexpected getAccountInfo data shape")
}

/// `getAccountInfo` over HTTP JSON-RPC (same wire format wallets use).
pub async fn fetch_escrow_account_info(
    http: &reqwest::Client,
    rpc_url: &str,
    escrow_pubkey: &Pubkey,
) -> Result<serde_json::Value> {
    let body = json!({
        "jsonrpc": "2.0",
        "id": 1u64,
        "method": "getAccountInfo",
        "params": [
            escrow_pubkey.to_string(),
            {"encoding": "base64", "commitment": "confirmed"},
        ],
    });

    let resp = http
        .post(rpc_url)
        .json(&body)
        .send()
        .await
        .context("solana json-rpc post")?;

    let v: serde_json::Value = resp.json().await.context("solana json-rpc json")?;

    if let Some(err) = v.get("error") {
        return Ok(json!({
            "escrow_pubkey": escrow_pubkey.to_string(),
            "error": err,
        }));
    }

    let value = &v["result"]["value"];
    if value.is_null() {
        return Ok(json!({
            "escrow_pubkey": escrow_pubkey.to_string(),
            "error": "account not found",
        }));
    }

    let lamports = value["lamports"].as_u64().unwrap_or(0);

    let raw = match decode_rpc_account_bytes(&value["data"]) {
        Ok(b) => b,
        Err(e) => {
            return Ok(json!({
                "escrow_pubkey": escrow_pubkey.to_string(),
                "lamports": lamports,
                "parse_error": e.to_string(),
            }));
        }
    };

    let parsed = parse_escrow_account(&raw)
        .unwrap_or_else(|| json!({"note": "unparsed_or_empty_escrow_layout"}));

    Ok(json!({
        "escrow_pubkey": escrow_pubkey.to_string(),
        "lamports": lamports,
        "parsed": parsed,
    }))
}

/// For tests / scripts: fetch raw `getAccountInfo` JSON (program bytecode check, etc.).
pub async fn rpc_get_account_info(
    http: &reqwest::Client,
    rpc_url: &str,
    pubkey: &Pubkey,
) -> Result<serde_json::Value> {
    let body = json!({
        "jsonrpc": "2.0",
        "id": 1u64,
        "method": "getAccountInfo",
        "params": [
            pubkey.to_string(),
            {"encoding": "base64", "commitment": "confirmed"},
        ],
    });
    let resp = http
        .post(rpc_url)
        .json(&body)
        .send()
        .await
        .context("rpc post")?;
    resp.json().await.context("rpc json")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    /// Cross-checked with `mobile` @solana/web3.js findProgramAddressSync (same seeds).
    #[test]
    fn escrow_and_vault_pda_match_known_fixture() {
        let program = Pubkey::from_str("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn").unwrap();
        let buyer = Pubkey::from_str("So11111111111111111111111111111111111111112").unwrap();
        let seller = Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap();
        let seed = [1u8, 2, 3, 4, 5, 6, 7, 8];
        let (escrow, _) = escrow_pda(&program, &buyer, &seller, &seed);
        let (vault, _) = vault_pda(&program, &escrow);
        assert_eq!(
            escrow.to_string(),
            "CmgGg7QKYPFutZAzZNzyFd32ktoBF54d4g66kt91hNCb"
        );
        assert_eq!(
            vault.to_string(),
            "FXf3jukbDCRUjsjX1UZRSpi9tmjFaLwCzEWtuw4bSxYS"
        );
    }

    #[test]
    fn parse_escrow_account_decodes_layout_and_status() {
        let mut data = vec![0u8; 128];
        let amount: u64 = 9_999;
        data[104..112].copy_from_slice(&amount.to_le_bytes());
        for i in 0..8 {
            data[112 + i] = i as u8;
        }
        data[120] = 7;
        data[121] = 8;
        data[122] = 1u8;

        let j = parse_escrow_account(&data).expect("parsed");
        assert_eq!(j["amount_lamports"], serde_json::json!(9999));
        assert_eq!(j["deal_seed_hex"], "0001020304050607");
        assert_eq!(j["bump_escrow"], serde_json::json!(7));
        assert_eq!(j["bump_vault"], serde_json::json!(8));
        assert_eq!(j["status"], "funded");
        assert_eq!(j["status_raw"], serde_json::json!(1));
    }

    #[test]
    fn parse_escrow_account_short_buffer_returns_none() {
        let data = vec![0u8; 50];
        assert!(parse_escrow_account(&data).is_none());
    }
}
