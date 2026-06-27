$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Pnpm = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
$NodeBin = "C:\Users\60928\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
Set-Location $Root
$env:Path = "$NodeBin;$env:Path"
& $Pnpm run dev
