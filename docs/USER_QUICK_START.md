# 用户快速上手

## 1. 启动

解压 `AI-Tuning-Rack-win-x64.zip`，双击：

```text
AI Tuning Rack.exe
```

## 2. 配置模型

右侧会显示模型配置区。

普通用户：

1. 粘贴 DeepSeek API Key。
2. 点击“保存”。

高级用户可以展开“高级模型设置”，填写自己的 OpenAI-compatible 接口：

- Base URL
- Model
- API Key

## 3. 选择目标宿主

可选：

- Studio Pro 8
- Studio One 6
- Studio One 7
- Cubase / Nuendo
- FL Studio
- Ableton Live
- 通用 VST 插件链

## 4. 选择输入方式

### 实时监听

选择监听输入设备，然后点击“开始”。

如果要让工具听到 DAW 或机架处理后的声音，需要通过虚拟声卡或音频路由把声音送到一个可监听输入。

### 录音文件分析

上传：

- 干声 WAV
- 伴奏 WAV

然后点击“分析录音”。

## 5. 生成方案

填写声音目标，例如：

```text
温柔贴耳，不刺耳，适合语音厅男歌
```

点击：

```text
生成完整调试方案
```

## 6. 继续微调

拿到方案后试唱，再把主观感受告诉工具，例如：

- 太闷
- 太刺
- 太空
- 压得太死
- 不够贴耳
- 混响太多

工具会继续给下一轮参数微调建议。
