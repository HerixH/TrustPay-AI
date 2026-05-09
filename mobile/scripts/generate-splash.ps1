# Delegates to generate-assets.ps1 (splash uses splash-icon.png from the same pipeline).
$here = $PSScriptRoot
& (Join-Path $here 'generate-assets.ps1')
