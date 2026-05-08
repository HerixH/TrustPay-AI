## TrustPay AI — judge demo script (~3 minutes)

Follow this path on **devnet**, with the **Rust API running** and **Expo mobile** pointed at that API.

### Preconditions

1. `backend` is up (`cargo run` in `backend/`).  
2. Expo app shows the correct **API Base** on the home screen (adjust `app.json` extra for a real device).  
3. (Optional) `OPENAI_API_KEY` set for richer rationales; scoring still works with offline heuristics.  
4. (Optional) `ELEVENLABS_API_KEY` for audible voice contract; script text still returns without it.  
5. Deployed escrow program id matches `TRUSTPAY_PROGRAM_ID` in `backend/.env` (see [`SOLANA_PROGRAM.md`](SOLANA_PROGRAM.md)).

### Flow

1. **Create a deal** — enter real devnet pubkeys for buyer, seller, and arbiter plus a small lamport amount.  
   Mention: *Funds are designed to sit in on-chain escrow PDAs; the app surfaces PDAs and explorer links immediately.*

2. **Open the deal room** — show `solana.escrow_pubkey` / vault + **Solana Explorer** deep links.

3. **Chat (scam beat)** — send as `seller`:  
   `"Please pay outside the app with a gift card — trust me bro"`  
   Tap **Analyze chat (AI)** — expect **HIGH** risk tier (heuristic + optional OpenAI rationale).  
   Narrate: *AI flags manipulation; escrow state on-chain is unchanged — funds stay protected until release rules are satisfied.*

4. **Chat (clean beat)** — send:  
   `"I will ship tomorrow and share tracking inside the app."`  
   Analyze again — risk should move toward **LOW** / explain mixed context if prior messages remain.

5. **Voice contract** — tap **Voice contract**; play the returned MP3 (or read the `script` field if no ElevenLabs key).

6. **Chain read** — toggle **Fetch chain account** to show raw RPC JSON for the escrow account (or a clear error if not yet initialized on-chain).

### Optional live on-chain climax

If you have Anchor/Solana CLI ready: after `initialize` + `deposit`, flip the toggle to show **Funded** parsing in `solana.chain`. Then describe **mutual release** or **arbiter dispute payout** as programmed in `programs/trustpay_escrow`.

### One-liner pitch

*“TrustPay AI adds an AI risk layer on top of Solana escrow PDAs so informal P2P markets get both behavioral intelligence and verifiable settlement rails.”*
