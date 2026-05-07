# TrustPay AI

AI-powered smart escrow and fraud detection for peer-to-peer payments—aimed at reducing scams, rebuilding trust, and protecting buyers and sellers, with a focus on emerging markets.

**Team Chain Minds**

- Ropafadzo Tambara  
- Surajo Hussain  
- Diana Ndlovu  
- Herix Hangandu  

---

## Problem

P2P payments often lack a simple trust layer: freelancers get ghosted, buyers lose money to scams, and neither side has strong protection during a deal.

## Solution

TrustPay AI combines:

- **Smart escrow** — funds stay locked until conditions for release are met.  
- **AI fraud detection** — in-app conversations and behavioral signals are analyzed to surface scam risk before money moves.

Together, these aim to act as **trust infrastructure** for digital payments—not only a single product feature.

## Core capabilities (target)

| Area | Description |
|------|-------------|
| Smart escrow | Secure, rule-based holding and release of funds (e.g. smart contract / chain-backed flow). |
| AI risk signals | Chat and behavior analysis to flag suspicious patterns early. |
| Risk visibility | Dashboard for deal-level risk scoring and status. |
| Voice confirmation | Voice-assisted contract or step confirmation where applicable. |
| Disputes | Path for contested releases and resolution workflows. |

## How it works (high level)

1. Buyer creates a deal and funds are placed in escrow.  
2. Buyer and seller communicate in-app.  
3. AI analyzes messages and related signals and flags elevated risk when appropriate.  
4. Payment is released according to rules, held longer, or routed into dispute handling.

## Intended tech direction

The project pitch references a stack along these lines (subject to change as the repo grows):

- **Client:** React Native (mobile), modern web UI patterns where relevant.  
- **Backend / chain:** Solana-oriented escrow and program logic; services in Rust where used for performance and safety.  
- **AI / NLP:** LLM and related APIs for conversation and risk analysis (e.g. OpenAI-class models).  
- **Voice:** Integration with voice AI providers (e.g. ElevenLabs) for voice UX where specified.

Exact versions, folder layout, and commands will be added once application code lives in this repository.

## Repository status

This repository is **early stage**: project documentation and positioning are defined here first; application source, dependency manifests, and runbooks will be filled in as development proceeds.

### Planned sections (for when code lands)

- Prerequisites (language runtimes, Node, Rust toolchain, Solana CLI, etc.)  
- Environment variables and secrets policy  
- `install` / `build` / `test` / `run` commands  
- Contributing and branch conventions  

## Contributing

When the codebase is present: open issues for bugs and ideas, use pull requests for changes, and keep escrow and fraud-handling paths reviewed for safety and compliance.

## License

To be determined.
