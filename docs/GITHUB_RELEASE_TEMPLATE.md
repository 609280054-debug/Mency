# AI Tuning Rack v0.1.0 Preview

Windows 桌面 AI 调音智能体预览版。

## 下载

下载 `AI-Tuning-Rack-win-x64.zip`，解压后运行：

```text
AI Tuning Rack.exe
```

## 主要功能

- 实时监听 Windows 音频输入
- 分析人声电平、浑浊、齿音、贴耳清晰度和削波风险
- 支持上传干声 WAV 和伴奏 WAV
- 支持 Studio Pro 8、Studio One 6/7 和通用 VST 插件链参数建议
- 支持 OpenAI-compatible 模型接口，默认推荐 DeepSeek v4 pro
- 一键生成专业调音师流程的完整调试方案

## 使用前准备

你需要一个模型 API Key。默认推荐 DeepSeek：

```text
https://api.deepseek.com
deepseek-v4-pro
```

应用启动后，在右侧粘贴 API Key 并保存即可。

## 注意

- 当前版本不会自动控制 DAW 或插件，只提供可照抄的参数建议。
- 当前文件分析只支持 WAV。
- 这是无签名预览版，Windows 可能提示未知发布者。
- 如果需要监听 DAW 或机架处理后的声音，请使用虚拟声卡或音频路由。

## 文件校验

发布前填写：

```text
ZIP:
SHA256:
```
