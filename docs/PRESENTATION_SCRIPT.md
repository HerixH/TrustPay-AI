# TrustPay AI — demo submission script (~3 minutes)

**Use for:** recorded demo, slide voiceover, or live walkthrough for a **submission** (not a Q&A panel).  
**Length:** about **2:45–3:00** at a clear pace (~130–150 words/min). Practice once with a timer; cut the bracketed demo section if you run long.

---

## Script (read or memorize)

**[Opening — ~20 s]**  
Peer-to-peer deals are everywhere — freelance work, resales, anything where money leaves your wallet before trust is earned. The failure mode is familiar: scams, ghosting, or both sides arguing after the fact. We built something that stays **simple in the UI** and **serious under the hood**.

**[What TrustPay AI is — ~25 s]**  
**TrustPay AI** is a mobile experience that combines **smart escrow on Solana** with **risk signals from the in-deal chat** — so users see a clearer picture of risk **before** funds move, not after.

**[How it works — ~50 s]**  
Three beats. **First:** the app talks to a **Rust API** that stores deals and messages — lightweight, SQLite-backed. We host ours on **Railway** for this submission; it exposes REST endpoints the app uses for every screen. **Second:** conditional money uses a **Solana escrow program** — signing happens **on the device**; the API **never holds private keys**. **Third:** when users chat, **Analyze** runs **server-side scoring** — heuristics always, optional extras when API keys are set — and returns a **risk tier** and short rationale. It’s **decision support** in the same place people negotiate.

**[What this submission shows — ~45 s]** *[Shorten if needed]*  
In this demo you’ll see: **create a deal** → **in-app chat** → **Analyze** and the risk readout → **on-chain escrow** — initialize, deposit, and the path to **mutual release** or **dispute with an arbiter**. Optional: **Expo web on Vercel** for browser access; **Android** can use **Mobile Wallet Adapter** (e.g. Phantom) with a dev build. One thread for **trust, money, and evidence**.

**[Closing — ~20 s]**  
We’re **Team Chain Minds**. **TrustPay AI** is our end-to-end stack — **React Native / Expo**, **Rust API**, **Solana devnet escrow** — aimed at **trust infrastructure for digital payments**, not a single checkbox feature. Thanks for reviewing this submission.

---

## Timing checkpoints

| Time | You should be finishing… |
|------|---------------------------|
| ~0:45 | “…before funds move, not after.” |
| ~1:35 | “…same place people negotiate.” |
| ~2:25 | “…trust, money, and evidence.” |
| ~2:55 | “…reviewing this submission.” |

---

## One-line version (~90 seconds or backup slide)

> “**TrustPay AI** is P2P-style deals with **Solana escrow** and **conversation-aware risk cues** — keys stay on-device, deal and chat state live in a **Rust API** on **Railway**, and we treat **trust as infrastructure**.”

---

## Submission checklist *(before you record)*

- [ ] API **`/health`** returns **`ok`** (Railway or local)
- [ ] App build points at that API (`EXPO_PUBLIC_*` / `trustpayApiUrl` as appropriate)
- [ ] Devnet SOL funded for on-chain steps you’ll show
- [ ] One chat line ready for **Analyze** (e.g. off-platform / gift-card wording)
