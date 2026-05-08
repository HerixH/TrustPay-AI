//! Optional: verifies devnet RPC + deployed program account (run after `anchor deploy`).
use solana_pubkey::Pubkey;
use std::str::FromStr;
use trustpay_api::solana_util::rpc_get_account_info;

#[tokio::test]
#[ignore = "Requires network; set TRUSTPAY_PROGRAM_ID to a deployed devnet program"]
async fn devnet_program_account_is_readable() {
    let rpc_url = std::env::var("SOLANA_RPC_URL")
        .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());
    let pid = std::env::var("TRUSTPAY_PROGRAM_ID").expect("TRUSTPAY_PROGRAM_ID");
    let program = Pubkey::from_str(pid.trim()).expect("valid program id");

    let client = reqwest::Client::new();
    let res = rpc_get_account_info(&client, &rpc_url, &program)
        .await
        .expect("json-rpc");

    assert!(
        res.get("error").is_none(),
        "rpc error: {}",
        res["error"]
    );

    let value = &res["result"]["value"];
    assert!(
        !value.is_null(),
        "program account missing — deploy the escrow program first"
    );

    let executable = value["executable"].as_bool().unwrap_or(false);
    assert!(
        executable,
        "expected an executable program account on-chain"
    );
}
