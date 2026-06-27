$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Python = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Pnpm = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
$NodeBin = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

Set-Location $Root
$env:Path = "$NodeBin;$env:Path"
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"

if (!(Test-Path ".venv")) {
  & $Python -m venv .venv
}

& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
& $Pnpm install

if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
}

Write-Host "Environment ready. Edit .env for model keys, then run scripts\dev.ps1."
