# Mency AI Tuning Rack Installation And Usage Guide

This guide is written for first-time users. You do not need to know programming. If you can download a ZIP file, unzip it, and paste an API key, you can use the app.

## 1. What This App Does

Mency AI Tuning Rack is a Windows desktop assistant for vocal tuning and mixing decisions.

You can give it a dry vocal and a backing track, or let it listen to audio playing from your DAW or rack. It analyzes the audio and uses an AI model to generate a practical tuning plan, including:

- What to fix first
- Which plugin types to use
- Suggested starting parameters
- What to listen for while testing
- How to adjust if the vocal sounds muddy, harsh, distant, over-compressed, or disconnected from the beat

The app does not automatically control Studio One, Cubase, FL Studio, Ableton, or any other DAW. It gives you a clear plan that you can follow manually.

## 2. Download

Open the download page:

https://609280054-debug.github.io/Mency/

Click `Download for Windows`.

You can also download the ZIP directly:

https://github.com/609280054-debug/Mency/releases/download/v0.1.0-preview/AI-Tuning-Rack-win-x64.zip

After downloading, you should have a ZIP file.

## 3. Install And Start

This preview version is portable. There is no installer yet.

1. Find `AI-Tuning-Rack-win-x64.zip`
2. Right-click the ZIP file
3. Choose `Extract All` or extract it with your archive tool
4. Open the extracted folder
5. Double-click `AI Tuning Rack.exe`

Windows may show an “unknown publisher” or “Windows protected your PC” warning. This happens because the preview build is not code-signed yet.

If you downloaded the file from the GitHub link above, you can open it like this:

1. Click `More info`
2. Click `Run anyway`

## 4. Prepare An API Key

The app needs an AI model API key to generate complete tuning plans. The public release does not include the developer's paid key.

Each user must enter their own API key.

### DeepSeek Settings

If you use DeepSeek, the usual settings are:

```text
Base URL: https://api.deepseek.com
Model: deepseek-v4-pro
API Key: paste your own DeepSeek API key
```

If DeepSeek changes model names later, use the model name shown in your DeepSeek dashboard.

### Can I Use Other Models?

Yes. Any OpenAI-compatible API should usually work.

You normally need three values:

```text
Base URL: the API endpoint from your model provider
Model: the model name
API Key: your API key
```

This can apply to providers such as OpenAI, Qwen, Kimi, OpenRouter, SiliconFlow, and others.

## 5. First-Time App Setup

After opening the app:

1. Find the model settings area on the right side
2. If you use DeepSeek, paste your API key
3. If you use another provider, open the advanced model settings
4. Enter Base URL, Model, and API Key
5. Click save

The app stores your settings locally on your own computer. Your API key is not uploaded to GitHub.

## 6. Choose A DAW Or Target Workflow

Choose the workflow that is closest to your setup.

Available targets include:

- Studio One 6
- Studio One 7
- Studio One 8
- Cubase / Nuendo
- FL Studio
- Ableton Live
- Generic VST Chain

If you are unsure, choose `Generic VST Chain`. It gives more general plugin-chain advice that can be used in most DAWs.

## 7. Method One: Upload Dry Vocal And Backing Track

This is the easiest and most reliable method.

Prepare two WAV files:

- Dry vocal: vocal only, without reverb, compression, or backing track
- Backing track: the instrumental, beat, or music bed

Steps:

1. Select your dry vocal WAV
2. Select your backing track WAV
3. Click the recording analysis button
4. Wait for the analysis result
5. Type your vocal goal
6. Generate the full tuning plan

Your vocal goal can be simple and natural, for example:

```text
I want the vocal to sound warm and close, not too harsh, suitable for a pop male vocal.
```

Or:

```text
Make it brighter and more forward, but keep the sibilance under control.
```

## 8. Method Two: Real-Time Monitoring

Real-time monitoring is useful when you do not want to export files and prefer to play audio directly from your DAW, rack, or host.

Basic steps:

1. Select an input device in the app
2. Start monitoring
3. Play your vocal in Studio One, your rack, or your DAW
4. Let the app collect real-time level and tone data
5. Generate the tuning plan

If the app cannot hear your DAW, the audio is probably not routed to a recordable input.

You may need:

- A virtual audio cable
- An audio interface with loopback
- DAW output routed to a monitorable input
- Or simply use the WAV upload method instead

## 9. How To Use The Generated Plan

The plan usually follows a professional tuning order:

1. Cleanup and low-end control
2. Pitch correction or vocal tuning
3. EQ
4. Compression
5. De-essing
6. Saturation or tone color
7. Reverb and delay
8. Vocal-to-backing balance
9. Final listening checks

Do not expect the first parameter set to be perfect. Treat it as a strong starting point, then adjust while listening.

## 10. How To Ask For Adjustments

After trying the first plan, describe what you hear. Simple language is fine.

Examples:

```text
The vocal sounds too muddy. I want it brighter.
```

```text
The s and ch sounds are too sharp.
```

```text
The compression feels too heavy and unnatural.
```

```text
There is too much reverb. The vocal feels too far away.
```

```text
The vocal does not sit inside the backing track.
```

The app can then suggest the next parameter changes.

## 11. Common Questions

### The app opens to a black screen. What should I do?

Make sure you downloaded the latest release. The packaged black-screen issue has already been fixed in the current build.

Also make sure you extracted the ZIP before running the app. Do not run the EXE directly from inside the ZIP.

### The model request fails. What should I check?

Check these three things first:

1. API Key
2. Base URL
3. Model name

### The plan takes a long time to generate. Is that normal?

It can happen depending on the model provider, network speed, and audio length. For testing, start with a short vocal clip, around 20 to 40 seconds.

### Will my API key be shared with other users?

No. The public package does not include your key. Keys entered on your machine are stored locally.

### I do not understand real-time audio routing. What should I do?

Use the dry vocal plus backing track upload method first. It is the easiest method for beginners.

## 12. Recommended Beginner Workflow

For your first test:

1. Download the ZIP
2. Extract it
3. Run `AI Tuning Rack.exe`
4. Enter your DeepSeek API key
5. Upload a 20 to 40 second dry vocal WAV
6. Upload the matching backing track WAV
7. Type one sentence describing your target sound
8. Generate the tuning plan
9. Apply the plugin chain in your DAW
10. Come back with listening feedback and generate the next adjustment
