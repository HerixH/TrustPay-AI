# Generates TrustPay AI brand assets (Solana-inspired palette, matches in-app LogoMark).
# Run from repo:  powershell -ExecutionPolicy Bypass -File mobile/scripts/generate-assets.ps1
Add-Type -AssemblyName System.Drawing

# PowerShell parses third ctor arg wrong with New-Object; use ::new + enum variable
$PIX_FMT = [Drawing.Imaging.PixelFormat]::Format32bppArgb

$assets = Join-Path (Split-Path -Parent $PSScriptRoot) 'assets'

# Theme-aligned (#030014, #9945FF, #14F195)
function Get-Color([int]$r, [int]$g, [int]$b, [int]$a = 255) {
  return [Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function New-GradientBrush([Drawing.RectangleF]$rect) {
  $p1 = [Drawing.Point]::new([int]$rect.Left, [int]$rect.Top)
  $p2 = [Drawing.Point]::new([int]$rect.Right, [int]$rect.Bottom)
  $c1 = Get-Color 20 241 149
  $c2 = Get-Color 153 69 255
  return New-Object Drawing.Drawing2D.LinearGradientBrush($p1, $p2, $c1, $c2)
}

function Add-RingPath([Drawing.Drawing2D.GraphicsPath]$path, [float]$cx, [float]$cy, [float]$outerR, [float]$innerR) {
  $path.AddEllipse([Drawing.RectangleF]::new($cx - $outerR, $cy - $outerR, $outerR * 2, $outerR * 2))
  $path.AddEllipse([Drawing.RectangleF]::new($cx - $innerR, $cy - $innerR, $innerR * 2, $innerR * 2))
}

function Draw-TrustLogo {
  param(
    [Drawing.Graphics]$g,
    [float]$cx,
    [float]$cy,
    [float]$outerR,
    [bool]$TransparentInner,
    [Drawing.Color]$Bg
  )
  $ringW = [math]::Max(4.0, $outerR * 0.045)
  $innerR = $outerR - $ringW

  $bounds = [Drawing.RectangleF]::new($cx - $outerR, $cy - $outerR, $outerR * 2, $outerR * 2)
  $brush = New-GradientBrush $bounds
  $path = New-Object Drawing.Drawing2D.GraphicsPath
  $path.FillMode = [Drawing.Drawing2D.FillMode]::Alternate
  Add-RingPath $path $cx $cy $outerR $innerR

  $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.FillPath($brush, $path)
  $path.Dispose()
  $brush.Dispose()

  if (-not $TransparentInner) {
    $in = New-Object Drawing.SolidBrush $Bg
    $g.FillEllipse($in, $cx - $innerR, $cy - $innerR, $innerR * 2, $innerR * 2)
    $in.Dispose()
  }

  # Two mint dots — same proportions as LogoMark (40px ref: dot 12% width, flex gap 6)
  $diam = $outerR * 2
  $dotD = 0.12 * $diam
  $dotR = $dotD / 2
  $gap = 6.0 * ($diam / 40.0)
  $dCenter = 2 * $dotR + $gap
  $half = $dCenter / 2
  $mint = New-Object Drawing.SolidBrush (Get-Color 20 241 149)
  $g.FillEllipse($mint, $cx - $half - $dotR, $cy - $dotR, $dotD, $dotD)
  $g.FillEllipse($mint, $cx + $half - $dotR, $cy - $dotR, $dotD, $dotD)
  $mint.Dispose()
}

function Save-Png([Drawing.Bitmap]$bmp, [string]$path) {
  $dir = Split-Path -Parent $path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $bmp.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Wrote $path"
}

# ——— App icon: solid deep space + logo ———
$iconSize = 1024
$bmpIcon = [Drawing.Bitmap]::new($iconSize, $iconSize, $PIX_FMT)
$gIcon = [Drawing.Graphics]::FromImage($bmpIcon)
$bg = Get-Color 3 0 20
$gIcon.Clear($bg)
Draw-TrustLogo $gIcon ($iconSize / 2) ($iconSize / 2) 320 $false $bg
$gIcon.Dispose()
Save-Png $bmpIcon (Join-Path $assets 'icon.png')
$bmpIcon.Dispose()

# ——— Android adaptive foreground: transparent outside logo cluster ———
$bmpAd = [Drawing.Bitmap]::new($iconSize, $iconSize, $PIX_FMT)
$gAd = [Drawing.Graphics]::FromImage($bmpAd)
$gAd.Clear([Drawing.Color]::Transparent)
Draw-TrustLogo $gAd ($iconSize / 2) ($iconSize / 2) 320 $true $bg
$gAd.Dispose()
Save-Png $bmpAd (Join-Path $assets 'adaptive-icon.png')
$bmpAd.Dispose()

# ——— Splash: same as icon so splash backgroundColor blends ———
$bmpSp = [Drawing.Bitmap]::new($iconSize, $iconSize, $PIX_FMT)
$gSp = [Drawing.Graphics]::FromImage($bmpSp)
$gSp.Clear($bg)
Draw-TrustLogo $gSp ($iconSize / 2) ($iconSize / 2) 340 $false $bg
$gSp.Dispose()
Save-Png $bmpSp (Join-Path $assets 'splash-icon.png')
$bmpSp.Dispose()

# ——— Favicon ———
$fav = 64
$bmpF = [Drawing.Bitmap]::new($fav, $fav, $PIX_FMT)
$gF = [Drawing.Graphics]::FromImage($bmpF)
$gF.Clear($bg)
Draw-TrustLogo $gF ($fav / 2) ($fav / 2) ($fav * 0.36) $false $bg
$gF.Dispose()
Save-Png $bmpF (Join-Path $assets 'favicon.png')
$bmpF.Dispose()

Write-Host 'Done. Rebuild the app to pick up new assets.'
