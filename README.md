# AI Tuning Rack

第一版目标：Windows 桌面实时监听 + 本地音频分析 + AI 对话调音建议 + 通用机架/DAW/VST 插件链参数输出。

默认目标宿主是 Studio Pro 8，用户也可以切换到 Studio One 6、Studio One 7 或通用 VST 插件链。第一版不自动控制宿主软件，只输出可以照抄的调音参数。

核心流程是“干声 + 伴奏”调试：工具根据人声音色、实时监听数据、目标风格和伴奏关系，输出像专业调音师一样的插件链和参数起点。

工具同时支持两种输入方式：

- 实时监听：用户直接在宿主、机架或 DAW 里录音/播放，工具通过麦克风、虚拟声卡或音频路由实时听。
- 录音文件分析：用户上传干声 WAV 和伴奏 WAV，适合不方便当场唱歌时先做调试方案。

## 下载使用

当前 Windows 便携预览包：

```text
release/AI-Tuning-Rack-win-x64.zip
```

解压后运行：

```text
AI Tuning Rack.exe
```

详细使用说明见：

- [用户快速上手](docs/USER_QUICK_START.md)
- [发布说明](RELEASE_NOTES.md)

## 环境

开发环境可以使用项目脚本指定的本地运行时，不要求先全局安装 Node 或 Python。

```powershell
.\scripts\setup.ps1
```

## 启动

一键启动后端和桌面应用：

```powershell
.\scripts\start.ps1
```

Electron 会自动启动和关闭本地 Python 后端。也可以分开启动。先开后端：

```powershell
.\scripts\backend.ps1
```

再开桌面前端：

```powershell
.\scripts\dev.ps1
```

只开浏览器版前端：

```powershell
.\scripts\frontend.ps1
```

## 模型接口

默认推荐 DeepSeek v4 pro。应用也支持 OpenAI-compatible 自定义接口，例如 OpenAI、Qwen、Kimi、OpenRouter、硅基流动等。

普通用户只需要在应用右侧粘贴 API Key。高级用户可以展开“高级模型设置”，修改：

- Base URL
- Model

也可以手动配置 `.env`：

```dotenv
EXTERNAL_LLM_BASE_URL=https://api.deepseek.com
EXTERNAL_LLM_API_KEY=你的 key
EXTERNAL_LLM_MODEL=deepseek-v4-pro
```

## 当前功能

- 列出 Windows 输入设备
- 选择一个输入源监听
- 实时计算 Peak、RMS、浑浊、齿音、贴耳清晰度、削波风险
- 分析干声 WAV 和伴奏 WAV 的电平、频段特征和人声/伴奏关系
- 将实时分析数据和用户目标发送到模型接口
- 输出目标宿主或通用插件链可照抄的参数建议
- 支持按专业调音流程输出插件链、参数起点、试唱检查点和迭代方向

## 推荐操作流程

1. 选择目标宿主，例如 Studio Pro 8 或 Studio One 7。
2. 选择调音流程，默认使用“干声 + 伴奏调试方案”。
3. 有录音时上传干声 WAV 和伴奏 WAV，并点击“分析录音”。
4. 没有录音时开启实时监听，直接在宿主或机架里播放/录唱。
5. 填写声音目标，例如“温柔贴耳，不刺耳，适合语音厅男歌”。
6. 如果还没配置模型 Key，在右侧粘贴 API Key 并保存。
7. 点击“生成完整调试方案”。
8. 按方案试唱，再用聊天区反馈“太闷”“太刺”“太空”“压得太死”等继续微调。
