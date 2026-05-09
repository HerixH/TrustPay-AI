# Validates ELEVENLABS_API_KEY:
# 1) GET /v1/user (needs "user_read" on restricted keys)
# 2) If that fails with missing_permissions, POST /v1/text-to-speech (same as TrustPay backend)
#
# Usage:
#   .\backend\scripts\test-elevenlabs.ps1
#   $env:ELEVENLABS_API_KEY = 'sk_...'; .\backend\scripts\test-elevenlabs.ps1

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$envFile = Join-Path $here "..\.env"

function Get-DotenvValue([string]$line, [string]$name) {
    if ($line -notmatch "^\s*$name\s*=\s*(.+)\s*$") { return $null }
    $raw = $Matches[1].Trim().Trim('"')
    $hash = $raw.IndexOf('#')
    if ($hash -ge 0) { $raw = $raw.Substring(0, $hash).Trim() }
    if ($raw) { return $raw }
    return $null
}

$key = $env:ELEVENLABS_API_KEY
$voiceId = $env:ELEVENLABS_VOICE_ID
$modelId = $env:ELEVENLABS_MODEL_ID

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $v = Get-DotenvValue $_ "ELEVENLABS_API_KEY"
        if ($v) { $script:key = $v }
        $v = Get-DotenvValue $_ "ELEVENLABS_VOICE_ID"
        if ($v) { $script:voiceId = $v }
        $v = Get-DotenvValue $_ "ELEVENLABS_MODEL_ID"
        if ($v) { $script:modelId = $v }
    }
}

if (-not $key) {
    Write-Host "Set ELEVENLABS_API_KEY or add it to backend\.env" -ForegroundColor Red
    exit 1
}

$key = $key.Trim().Trim([char]0xFEFF)
if ($key -match '\s') {
    Write-Host "ERROR: API key contains whitespace or newlines." -ForegroundColor Red
    exit 1
}
if (-not $voiceId) { $voiceId = "21m00Tcm4TlvDq8ikWAM" }
if (-not $modelId) { $modelId = "eleven_flash_v2_5" }

$uriUser = "https://api.elevenlabs.io/v1/user"
try {
    $r = Invoke-RestMethod -Uri $uriUser -Headers @{ "xi-api-key" = $key } -Method Get
    Write-Host "OK - API key valid (/v1/user). Voice contract TTS should work." -ForegroundColor Green
    if ($r.subscription) {
        Write-Host ("Plan / tier: " + ($r.subscription.tier | ConvertTo-Json -Compress))
    }
    exit 0
} catch {
    $detail = $null
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor DarkGray
        try { $detail = $_.ErrorDetails.Message | ConvertFrom-Json } catch { }
    }
    $missingUserRead = $false
    if ($detail -and $detail.detail -and $detail.detail.status -eq "missing_permissions") { $missingUserRead = $true }
    if (-not $missingUserRead) {
        Write-Host "FAILED - /v1/user rejected this key." -ForegroundColor Red
        Write-Host ("(debug: key length={0}, starts with sk_={1})" -f $key.Length, $key.StartsWith("sk_")) -ForegroundColor DarkGray
        Write-Host $_.Exception.Message
        exit 1
    }
    Write-Host "Note: Key has no user_read - trying Text-to-speech (what TrustPay uses)..." -ForegroundColor Yellow
}

$ttsUri = "https://api.elevenlabs.io/v1/text-to-speech/$voiceId"
$bodyObj = @{ text = "test"; model_id = $modelId }
$body = $bodyObj | ConvertTo-Json -Compress

try {
    $resp = Invoke-WebRequest -Uri $ttsUri -Method Post `
        -Headers @{
        "xi-api-key"    = $key
        "Content-Type"  = "application/json"
        "Accept"        = "audio/mpeg"
    } `
        -Body $body -UseBasicParsing
    if ($resp.StatusCode -ne 200) {
        Write-Host ("FAILED - TTS returned HTTP " + $resp.StatusCode) -ForegroundColor Red
        exit 1
    }
    $n = $resp.RawContentLength
    Write-Host ("OK - Text-to-speech works (HTTP 200, " + $n + " bytes MP3). TrustPay voice-contract should work.") -ForegroundColor Green
    Write-Host "Tip: In ElevenLabs you can create a key with restricted scopes; TTS-only keys may fail /v1/user but still work here." -ForegroundColor DarkGray
    exit 0
} catch {
    Write-Host "FAILED - Text-to-speech request rejected." -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    exit 1
}
