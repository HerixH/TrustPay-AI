//! HTTP integration tests: full router + SQLite (temp dir).
use axum::body::Body;
use axum::http::header::CONTENT_TYPE;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use solana_pubkey::Pubkey;
use std::str::FromStr;
use tower::ServiceExt;
use trustpay_api::handlers::AppState;
use trustpay_api::{app, db};

fn test_app(tmp: &tempfile::NamedTempFile) -> axum::Router {
    let path = tmp.path().to_str().unwrap();
    let db = db::Db::connect(path).expect("db");
    let http = reqwest::Client::new();
    let state = AppState {
        db,
        http,
        openai_key: None,
        eleven_key: None,
        eleven_voice_id: "test".to_string(),
        solana_rpc: "https://api.devnet.solana.com".to_string(),
        program_id: Pubkey::from_str("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn")
            .expect("program id"),
    };
    app(state)
}

fn sample_create_body() -> Value {
    json!({
        "buyer": "So11111111111111111111111111111111111111112",
        "seller": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "arbiter": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        "amount_lamports": 1_000_000u64,
    })
}

#[tokio::test]
async fn health_returns_ok() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);
    let res = app
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = res.into_body().collect().await.unwrap().to_bytes();
    assert_eq!(std::str::from_utf8(&body).unwrap(), "ok");
}

#[tokio::test]
async fn create_list_and_get_deal() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);

    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/deals")
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(sample_create_body().to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let created: Value = serde_json::from_slice(&body).unwrap();
    let id = created["id"].as_str().expect("deal id");
    assert!(created["pdas"]["escrow"].as_str().is_some());

    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/deals")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let list: Vec<Value> = serde_json::from_slice(
        &res.into_body().collect().await.unwrap().to_bytes(),
    )
    .unwrap();
    assert_eq!(list.len(), 1);
    assert_eq!(list[0]["id"].as_str().unwrap(), id);

    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/deals/{id}"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let bundle: Value = serde_json::from_slice(
        &res.into_body().collect().await.unwrap().to_bytes(),
    )
    .unwrap();
    assert_eq!(bundle["deal"]["id"].as_str().unwrap(), id);
}

#[tokio::test]
async fn get_deal_unknown_returns_404() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);
    let res = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/deals/00000000-0000-0000-0000-000000000000")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn create_deal_invalid_pubkey_is_400() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);
    let bad = json!({
        "buyer": "not-a-pubkey",
        "seller": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "arbiter": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        "amount_lamports": 1u64,
    });
    let res = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/deals")
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(bad.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn messages_roundtrip() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);

    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/deals")
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(sample_create_body().to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let created: Value = serde_json::from_slice(&body).unwrap();
    let id = created["id"].as_str().unwrap();

    let msg_body = json!({ "sender": "buyer", "body": "hello" });
    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/deals/{id}/messages"))
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(msg_body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let res = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/deals/{id}/messages"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let list: Vec<Value> = serde_json::from_slice(
        &res.into_body().collect().await.unwrap().to_bytes(),
    )
    .unwrap();
    assert_eq!(list.len(), 1);
    assert_eq!(list[0]["body"], "hello");
}

#[tokio::test]
async fn analyze_marks_scam_chat_as_high_tier() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);

    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/deals")
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(sample_create_body().to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let created: Value = serde_json::from_slice(&body).unwrap();
    let id = created["id"].as_str().expect("deal id");

    let scam = json!({
        "sender": "seller",
        "body": "Please pay outside with a gift card — trust me bro"
    });
    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/deals/{id}/messages"))
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(scam.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let res = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/deals/{id}/analyze"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let out: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(out["tier"], "high");
}

#[tokio::test]
async fn voice_contract_without_eleven_returns_script_json() {
    let tmp = tempfile::NamedTempFile::new().expect("temp db");
    let app = test_app(&tmp);

    let res = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/deals")
                .header(CONTENT_TYPE, "application/json")
                .body(Body::from(sample_create_body().to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let created: Value = serde_json::from_slice(&body).unwrap();
    let id = created["id"].as_str().unwrap();

    let res = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/deals/{id}/voice-contract"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let out: Value = serde_json::from_slice(&body).unwrap();
    assert!(out["script"].as_str().unwrap().len() > 20);
    assert!(out["audio_base64"].is_null() || out["audio_base64"] == Value::Null);
}
