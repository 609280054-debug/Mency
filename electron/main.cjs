const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const isDev = !app.isPackaged;
let backendProcess = null;

function getAppRoot() {
  return isDev ? path.join(__dirname, "..") : path.join(process.resourcesPath, "app");
}

function getBackendCommand() {
  const root = getAppRoot();
  const backendExe = path.join(root, "backend-dist", "ai-tuning-backend", "ai-tuning-backend.exe");
  if (fs.existsSync(backendExe)) {
    return { command: backendExe, args: [] };
  }

  const pythonCandidates = [
    path.join(root, ".venv", "Scripts", "python.exe"),
    path.join(root, "backend-runtime", "python.exe"),
    "python"
  ];
  const python = pythonCandidates.find((candidate) => candidate === "python" || fs.existsSync(candidate));
  return {
    command: python,
    args: ["-m", "uvicorn", "backend.app:app", "--host", "127.0.0.1", "--port", "8765"]
  };
}

function ensureEnvFile() {
  const root = getAppRoot();
  const envPath = path.join(root, ".env");
  const examplePath = path.join(root, ".env.example");
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
  }
}

function startBackend() {
  if (backendProcess) return;
  const root = getAppRoot();
  const backend = getBackendCommand();
  ensureEnvFile();
  backendProcess = spawn(
    backend.command,
    backend.args,
    {
      cwd: root,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONUTF8: "1"
      }
    }
  );

  backendProcess.on("exit", () => {
    backendProcess = null;
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 820,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: "#101217",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL("http://127.0.0.1:5173");
  } else {
    win.loadFile(path.join(getAppRoot(), "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", stopBackend);
