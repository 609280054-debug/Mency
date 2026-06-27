$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$InstallerPath = Join-Path $Root "release\Mency-AI-Tuning-Rack-Setup-0.1.0.exe"
$ZipPath = Join-Path $Root "release\AI-Tuning-Rack-win-x64.zip"
$AppPath = Join-Path $Root "release\win-unpacked\AI Tuning Rack.exe"
$EnvPath = Join-Path $Root "release\win-unpacked\resources\app\.env"
$ExamplePath = Join-Path $Root "release\win-unpacked\resources\app\.env.example"
$IndexPath = Join-Path $Root "release\win-unpacked\resources\app\dist\index.html"

if (!(Test-Path $InstallerPath)) { throw "Missing installer: $InstallerPath" }
if (!(Test-Path $ZipPath)) { throw "Missing release zip: $ZipPath" }
if (!(Test-Path $AppPath)) { throw "Missing app exe: $AppPath" }
if (Test-Path $EnvPath) { throw "Release package contains .env: $EnvPath" }
if (!(Test-Path $ExamplePath)) { throw "Missing .env.example: $ExamplePath" }
if (!(Test-Path $IndexPath)) { throw "Missing dist index.html: $IndexPath" }

$html = Get-Content -LiteralPath $IndexPath -Raw -Encoding UTF8
if ($html -notmatch '\./assets/') {
  throw "dist/index.html does not use relative asset paths."
}

$installerHash = Get-FileHash -Algorithm SHA256 -LiteralPath $InstallerPath
$zipHash = Get-FileHash -Algorithm SHA256 -LiteralPath $ZipPath
$installerSizeMb = [math]::Round((Get-Item -LiteralPath $InstallerPath).Length / 1MB, 2)
$zipSizeMb = [math]::Round((Get-Item -LiteralPath $ZipPath).Length / 1MB, 2)

Write-Host "Release check passed."
Write-Host "Installer: $InstallerPath"
Write-Host "Installer Size MB: $installerSizeMb"
Write-Host "Installer SHA256: $($installerHash.Hash)"
Write-Host "ZIP: $ZipPath"
Write-Host "ZIP Size MB: $zipSizeMb"
Write-Host "ZIP SHA256: $($zipHash.Hash)"
