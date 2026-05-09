# Validates ELEVENLABS_API_KEY with GET https://api.elevenlabs.io/v1/user (official auth check).
# Usage (from repo root or backend):
#   .\backend\scripts\test-elevenlabs.ps1
# Or pass key explicitly (avoid echoing in shared logs):
#   $env:ELEVENLABS_API_KEY = 'sk_...'; .\backend\scripts\test-elevenlabs.ps1

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$envFile = Join-Path $here "..\.env"
if (-not $env:ELEVENLABS_API_KEY -and (Test-Path $envFile)) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*ELEVENLABS_API_KEY\s*=\s*(.+)\s*$') {
            $raw = $Matches[1].Trim().Trim('"')
            # Drop inline # comments (unquoted .env lines)
            $hash = $raw.IndexOf('#')
            if ($hash -ge 0) { $raw = $raw.Substring(0, $hash).Trim() }
            $env:ELEVENLABS_API_KEY = $raw
        }
    }
}

$key = $env:ELEVENLABS_API_KEY
if (-not $key) {
    Write-Host "Set ELEVENLABS_API_KEY or add it to backend\.env" -ForegroundColor Red
    exit 1
}

$key = $key.Trim().Trim([char]0xFEFF)
if ($key -match '\s') {
    Write-Host "ERROR: API key contains whitespace or newlines - use a single line value only." -ForegroundColor Red
    exit 1
}
if (-not $key.StartsWith("sk_")) {
    Write-Host "Warning: key does not start with sk_ - use a User API key from https://elevenlabs.io (API Keys)." -ForegroundColor Yellow
}

$uri = "https://api.elevenlabs.io/v1/user"
try {
    $r = Invoke-RestMethod -Uri $uri -Headers @{ "xi-api-key" = $key } -Method Get
    Write-Host "OK - API key is valid (ElevenLabs /v1/user succeeded)." -ForegroundColor Green
    if ($r.subscription) {
        Write-Host ("Plan / tier: " + ($r.subscription.tier | ConvertTo-Json -Compress))
    }
    exit 0
} catch {
    Write-Host "FAILED - ElevenLabs rejected this key." -ForegroundColor Red
    Write-Host ("(debug: key length={0}, starts with sk_={1})" -f $key.Length, $key.StartsWith("sk_")) -ForegroundColor DarkGray
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
    exit 1
}
