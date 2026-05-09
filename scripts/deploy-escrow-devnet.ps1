# Deploy TrustPay escrow program to Solana devnet (Windows PowerShell).
# Prerequisites: Rust, Solana CLI, Anchor — see docs/SOLANA_PROGRAM.md
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Require-Cmd([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "Missing '$Name' in PATH. Install: https://solana.com/docs/cli/install-solana-cli-tools and https://www.anchor-lang.com/docs/installation"
  }
}

Require-Cmd solana
Require-Cmd anchor

Write-Host "==> Solana cluster -> devnet"
solana config set --url devnet

Write-Host "==> Devnet SOL for deploy keypair (ignore errors if already funded)"
solana airdrop 2 2>$null | Out-Null

Write-Host "==> Sync program id / keypair (updates declare_id + Anchor.toml)"
anchor keys sync

Write-Host "==> anchor build"
anchor build

Write-Host "==> anchor deploy"
anchor deploy --provider.cluster devnet

Write-Host ""
Write-Host "Done. Copy the program id into:"
Write-Host "  - backend/.env  TRUSTPAY_PROGRAM_ID=..."
Write-Host "  - mobile/app.json  expo.extra.programId"
Write-Host "(declare_id! and Anchor.toml should already match after anchor keys sync.)"
