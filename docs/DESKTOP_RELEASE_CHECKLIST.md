# 桌面发布检查清单

## 当前状态

Electron 主进程已经负责启动和关闭本地 Python 后端。

开发启动：

```powershell
.\scripts\start.ps1
```

启动后：

- Electron 打开桌面界面
- Electron 自动启动 FastAPI 后端
- 关闭应用时后端自动退出

## 下一步发布目标

把项目打成 Windows 下载包：

- 便携版 zip
- 后续安装版 exe

## 发布前必须确认

1. `.env` 不要包含个人 DeepSeek key。
2. 发布包里要提供 `.env.example`。
3. 首次启动时如果没有 `.env`，提示用户填写 DeepSeek key。
4. 普通用户只需要配置 DeepSeek API Key。
5. 打包时要包含后端 exe，避免用户自己装 Python。
6. 打包后的 `dist/index.html` 资源路径必须是 `./assets/...`，否则 release 版会黑屏。
7. 必须实际打开 `release/win-unpacked/AI Tuning Rack.exe` 检查 UI，不只检查后端 `/health`。

## 打包路线

第一阶段：

- `pnpm run build` 生成前端 dist
- Electron 加载 dist
- `pnpm run build:backend` 生成后端 exe
- `pnpm run package:win` 生成 `release/win-unpacked` 和 `release/AI-Tuning-Rack-win-x64.zip`
- 便携包包含前端、后端 exe、Electron 运行入口

第二阶段：

- 生成 Windows zip / nsis 安装包
- GitHub Releases 上传下载包

第三阶段：

- GitHub Pages 或 Vercel 做下载页
- 下载页链接到 GitHub Releases
