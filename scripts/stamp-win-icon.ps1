$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$AppExe = Join-Path $Root "release\win-unpacked\AI Tuning Rack.exe"
$Icon = Join-Path $Root "assets\mency-app-icon.ico"
$CacheRoot = Join-Path $env:LOCALAPPDATA "electron-builder\Cache\winCodeSign"

if (!(Test-Path $AppExe)) { throw "Missing app exe: $AppExe" }
if (!(Test-Path $Icon)) { throw "Missing icon: $Icon" }
if (!(Test-Path $CacheRoot)) { throw "Missing electron-builder winCodeSign cache: $CacheRoot" }

$Rcedit = Get-ChildItem -Path $CacheRoot -Recurse -Filter "rcedit-x64.exe" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (!$Rcedit) {
  throw "Could not find rcedit-x64.exe in $CacheRoot. Run electron-builder once so it can download winCodeSign."
}

& $Rcedit.FullName $AppExe --set-icon $Icon
if ($LASTEXITCODE -ne 0) { throw "rcedit failed with exit code $LASTEXITCODE" }

Write-Host "Stamped Windows icon: $AppExe"
