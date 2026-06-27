# Release Notes

## v0.1.0 Preview

首个 Windows 便携预览版。

### 已包含

- Windows 桌面应用界面
- 内置 Python 后端 exe，无需用户安装 Python
- 实时音频输入设备选择
- 实时 Peak、RMS、浑浊、齿音、贴耳清晰度、削波风险分析
- 干声 WAV 和伴奏 WAV 文件分析
- 目标宿主选择：Studio Pro 8、Studio One 6/7、Cubase、FL Studio、Ableton Live、通用 VST 插件链
- 调音流程选择：干声 + 伴奏调试方案、实时演唱监听微调、已处理人声诊断、通用插件链设计
- OpenAI-compatible 模型接口配置
- 默认推荐 DeepSeek v4 pro
- 一键生成完整调试方案

### 使用方式

1. 下载 `AI-Tuning-Rack-win-x64.zip`。
2. 解压到任意目录。
3. 双击 `AI Tuning Rack.exe`。
4. 在右侧粘贴模型 API Key。
5. 选择目标宿主和调音流程。
6. 开始实时监听，或上传干声/伴奏 WAV。
7. 点击“生成完整调试方案”。

### 已知限制

- 当前是无签名便携版，Windows 可能提示未知发布者。
- 文件分析第一版只支持标准 WAV。
- 第一版只输出参数建议，不自动控制 DAW、机架或插件。
- 实时监听依赖 Windows 当前可用的输入设备和音频路由。
- API Key 保存在本机 `.env` 文件中，不会上传到项目仓库。

### 推荐测试重点

- 应用启动后是否显示 UI，而不是黑屏。
- 右侧模型 Key 保存是否正常。
- 输入设备是否能列出。
- 实时监听是否能显示电平。
- 上传干声/伴奏 WAV 后是否能生成分析结果。
- 模型是否能返回完整插件链方案。
