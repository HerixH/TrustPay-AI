Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'assets\splash-icon.png'

$w = 1024
$h = 1024
$bmp = New-Object Drawing.Bitmap $w, $h
$g = [Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([Drawing.Color]::FromArgb(255, 18, 18, 18))

$cx = $w / 2
$cy = $h / 2 - 36

# Gradient ring (squircle approximation: rounded square via thick outline — draw circle ring)
$sqOuter = 216
$lgBrush = New-Object Drawing.Drawing2D.LinearGradientBrush `
  ([Drawing.Point]::new([int]($cx - 120), [int]($cy - 120)), `
   [Drawing.Point]::new([int]($cx + 120), [int]($cy + 120)), `
   [Drawing.Color]::FromArgb(255, 245, 245, 245), `
   [Drawing.Color]::FromArgb(255, 161, 161, 170))
$pen = New-Object Drawing.Pen($lgBrush, 6)
$pen.LineJoin = [Drawing.Drawing2D.LineJoin]::Round
$g.DrawEllipse($pen, $cx - $sqOuter/2, $cy - $sqOuter/2, $sqOuter, $sqOuter)
$pen.Dispose()
$lgBrush.Dispose()

$inner = $sqOuter - 18
$g.FillEllipse((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255,18,18,18))), $cx - $inner/2, $cy - $inner/2, $inner, $inner)

$dotR = 13
$gap = 26
$g.FillEllipse([Drawing.Brushes]::White, $cx - $gap - $dotR, $cy - $dotR, $dotR * 2, $dotR * 2)
$g.FillEllipse([Drawing.Brushes]::White, $cx + $gap - $dotR, $cy - $dotR, $dotR * 2, $dotR * 2)

$font = New-Object Drawing.Font('Segoe UI', 54, [Drawing.FontStyle]::Bold)
$sf = New-Object Drawing.StringFormat
$sf.Alignment = [Drawing.StringAlignment]::Center
$sf.LineAlignment = [Drawing.StringAlignment]::Near
$rect = [Drawing.RectangleF]::new(0, $cy + $sqOuter/2 + 36, $w, 200)
$g.DrawString('TrustPay AI', $font, [Drawing.Brushes]::White, $rect, $sf)

$g.Dispose()
$bmp.Save($out, [Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Wrote $out"
