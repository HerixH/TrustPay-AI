## TrustPay escrow program (Solana)

**Program path:** [`programs/trustpay_escrow`](../programs/trustpay_escrow)

### Prerequisites

Install [Rust](https://rustup.rs/), [Solana CLI](https://solana.com/docs/cli/install-solana-cli-tools), and [Anchor](https://www.anchor-lang.com/docs/installation).

### Point `declare_id!` at your keypair

The repo ships with placeholder program id `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn`. Before devnet deploy:

```bash
cd programs/trustpay_escrow
anchor keys list
# If needed:
anchor keys sync
```

This updates `declare_id!` in `src/lib.rs` and `Anchor.toml` program entries.

### Build

```bash
anchor build
```

### Deploy to devnet

```bash
solana config set --url devnet
solana airdrop 2
anchor deploy --provider.cluster devnet
```

Record the deployed program id in:

- [`backend/.env.example`](file:///backend/.env.example) as `TRUSTPAY_PROGRAM_ID`
- Mobile app environment (React Native constants)

### Instructions (MVP)

| Instruction        | Role |
|-------------------|------|
| `initialize`      | Buyer pays rent; creates escrow + vault PDAs; sets arbiter + amount. |
| `deposit`         | Buyer sends `amount` lamports into vault → **Funded**. |
| `release_mutual`   | Buyer **and** seller sign → payout to seller → **Released**. |
| `open_dispute`    | Buyer **or** seller → **Disputed**. |
| `resolve_dispute` | Arbiter signs; `pay_seller` pays seller or refunds buyer → **Released**. |

**PDA seeds**

- Escrow: `["escrow", buyer, seller, deal_seed_8]`
- Vault: `["vault", escrow_pubkey]`
