$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$ReleaseDir = Join-Path $Root "release"
$SourceDir = Join-Path $ReleaseDir "win-unpacked"
$ZipPath = Join-Path $ReleaseDir "AI-Tuning-Rack-win-x64.zip"

if (!(Test-Path $SourceDir)) {
  throw "Missing packaged app directory: $SourceDir"
}

if (Test-Path $ZipPath) {
  Remove-Item $ZipPath -Force
}

Compress-Archive -Path (Join-Path $SourceDir "*") -DestinationPath $ZipPath -CompressionLevel Optimal
Write-Host "Portable zip created: $ZipPath"
