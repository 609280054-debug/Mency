# Mency AI Tuning Rack

Mency AI Tuning Rack is a Windows desktop AI tuning assistant for vocal recording workflows.

It can listen to a dry vocal and backing track, analyze the basic audio features, and ask an OpenAI-compatible model to produce a practical tuning plan: plugin chain, starting parameters, listening checks, and follow-up adjustment advice.

## Download

- Website: https://609280054-debug.github.io/Mency/
- Release: https://github.com/609280054-debug/Mency/releases/tag/v0.1.0-preview
- Windows ZIP: https://github.com/609280054-debug/Mency/releases/download/v0.1.0-preview/AI-Tuning-Rack-win-x64.zip

## User Guides

- 中文安装与使用说明: [docs/INSTALL_USAGE_CN.md](docs/INSTALL_USAGE_CN.md)
- English installation and usage guide: [docs/INSTALL_USAGE_EN.md](docs/INSTALL_USAGE_EN.md)

## What It Does

- Real-time audio input monitoring
- Dry vocal WAV + backing WAV analysis
- AI tuning plan generation
- OpenAI-compatible model settings
- DeepSeek default configuration
- Studio One 6/7/8 workflow targets
- Generic VST plugin-chain output for other DAWs

## Important API Key Note

The public release does not include a paid API key. Each user needs to enter their own model API key inside the app.

The app stores local settings in a local `.env` file after first launch. That file is ignored by Git and is not included in the release package.

## Development

Install dependencies:

```powershell
.\scripts\setup.ps1
```

Start the desktop app in development mode:

```powershell
.\scripts\start.ps1
```

Build the Windows preview package:

```powershell
pnpm run package:win
```

Check the release package:

```powershell
pnpm run check:release
```
