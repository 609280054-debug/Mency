$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Pnpm = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
$NodeBin = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

Set-Location $Root
$env:Path = "$NodeBin;$env:Path"

Write-Host "Starting AI Tuning Rack..."
Write-Host "Electron will start and stop the local Python backend automatically."
& $Pnpm run dev
