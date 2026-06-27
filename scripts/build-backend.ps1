$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

& ".\.venv\Scripts\python.exe" -m PyInstaller `
  --name ai-tuning-backend `
  --onedir `
  --noconfirm `
  --clean `
  --distpath backend-dist `
  --workpath build\pyinstaller `
  --specpath build\pyinstaller `
  --collect-submodules backend `
  --collect-submodules uvicorn `
  --collect-submodules sounddevice `
  --hidden-import multipart `
  backend\run_server.py

Write-Host "Backend executable created in backend-dist\ai-tuning-backend"
