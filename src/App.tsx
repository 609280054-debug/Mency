import React, { useEffect, useMemo, useState } from "react";
import { Bot, Cable, CircleStop, FileAudio, Mic, Play, Save, Send, Sparkles, SlidersHorizontal } from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Device = {
  index: number;
  name: string;
  channels: number;
  samplerate: number;
};

type Analysis = {
  peak_db: number;
  rms_db: number;
  muddy_band_150_400hz: "low" | "medium" | "high";
  sibilance_5k_10k: "low" | "medium" | "high";
  presence_2k_5k: "low" | "medium" | "high";
  clipping_risk: boolean;
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  text: string;
};

type FileAnalysis = {
  error?: string;
  vocal?: Analysis & {
    filename: string;
    sample_rate: number;
    duration_seconds: number;
  };
  backing?: Analysis & {
    filename: string;
    sample_rate: number;
    duration_seconds: number;
  };
  vocal_backing_rms_delta_db?: number;
  relation_hint?: string;
};

type ConfigStatus = {
  has_api_key?: boolean;
  has_deepseek_key?: boolean;
  base_url: string;
  model: string;
};

const hostOptions = [
  "Studio Pro 8",
  "Studio One 6",
  "Studio One 7",
  "Cubase / Nuendo",
  "FL Studio",
  "Ableton Live",
  "通用 VST 插件链"
];

const workflowOptions = [
  "干声 + 伴奏调试方案",
  "实时演唱监听微调",
  "已处理人声诊断",
  "通用插件链设计"
];

const backendUrl = window.tuningAdvisor?.backendUrl ?? "http://127.0.0.1:8765";

function dbText(value: number) {
  if (!Number.isFinite(value)) return "-- dB";
  return `${value.toFixed(1)} dB`;
}

function levelWidth(value: number | undefined) {
  return `${Math.max(0, Math.min(100, (((value ?? -60) + 60) / 60) * 100))}%`;
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceIndex, setDeviceIndex] = useState<number | "">("");
  const [listening, setListening] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const provider = "external-api";
  const [targetHost, setTargetHost] = useState("Studio Pro 8");
  const [workflow, setWorkflow] = useState("干声 + 伴奏调试方案");
  const [goal, setGoal] = useState("温柔贴耳，不刺耳，适合语音厅男歌");
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [baseUrlInput, setBaseUrlInput] = useState("https://api.deepseek.com");
  const [modelInput, setModelInput] = useState("deepseek-v4-pro");
  const [showAdvancedModel, setShowAdvancedModel] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [vocalFile, setVocalFile] = useState<File | null>(null);
  const [backingFile, setBackingFile] = useState<File | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null);
  const [analyzingFiles, setAnalyzingFiles] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [input, setInput] = useState("");
  const [backendReady, setBackendReady] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("\u6b63\u5728\u8fde\u63a5\u672c\u5730\u540e\u7aef...");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "选择输入设备后开始监听。你可以描述想要的声音，我会结合实时数据给目标宿主或插件链参数建议。"
    }
  ]);

  useEffect(() => {
    let alive = true;
    let attempts = 0;
    let timer: number | undefined;

    async function loadDevices() {
      attempts += 1;
      try {
        const res = await fetch(`${backendUrl}/devices`);
        if (!res.ok) throw new Error(`Device request failed: ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        const nextDevices = data.devices ?? [];
        setDevices(nextDevices);
        setBackendReady(true);
        setDeviceStatus(nextDevices.length > 0 ? "\u8bf7\u9009\u62e9\u8f93\u5165\u8bbe\u5907" : "\u6ca1\u6709\u68c0\u6d4b\u5230\u53ef\u7528\u8f93\u5165\u8bbe\u5907");
      } catch {
        if (!alive) return;
        setBackendReady(false);
        setDeviceStatus(attempts < 20 ? "\u6b63\u5728\u542f\u52a8\u672c\u5730\u540e\u7aef..." : "\u540e\u7aef\u542f\u52a8\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u6253\u5f00\u5e94\u7528");
        timer = window.setTimeout(loadDevices, 1500);
      }
    }

    loadDevices();

    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;

    async function loadConfigStatus() {
      try {
        const res = await fetch(`${backendUrl}/config/status`);
        if (!res.ok) throw new Error(`Config request failed: ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setConfigStatus(data);
        setBaseUrlInput(data.base_url ?? "https://api.deepseek.com");
        setModelInput(data.model ?? "deepseek-v4-pro");
      } catch {
        if (!alive) return;
        setConfigStatus(null);
        timer = window.setTimeout(loadConfigStatus, 1500);
      }
    }

    loadConfigStatus();

    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    if (!listening || deviceIndex === "") return;
    const ws = new WebSocket(`${backendUrl.replace("http", "ws")}/ws/analyze?device=${deviceIndex}`);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as Analysis;
      setAnalysis(payload);
    };
    ws.onerror = () => setListening(false);
    ws.onclose = () => setListening(false);

    return () => ws.close();
  }, [listening, deviceIndex]);

  const healthItems = useMemo(() => {
    if (!analysis) return [];
    return [
      ["峰值", dbText(analysis.peak_db), analysis.clipping_risk ? "danger" : "ok"],
      ["平均响度", dbText(analysis.rms_db), analysis.rms_db > -12 ? "warn" : "ok"],
      ["浑浊", analysis.muddy_band_150_400hz, analysis.muddy_band_150_400hz === "high" ? "warn" : "ok"],
      ["齿音", analysis.sibilance_5k_10k, analysis.sibilance_5k_10k === "high" ? "warn" : "ok"],
      ["贴耳清晰度", analysis.presence_2k_5k, analysis.presence_2k_5k === "low" ? "warn" : "ok"]
    ];
  }, [analysis]);

  const channelStrips = useMemo(
    () => [
      { label: "LOW CUT", value: "80Hz" },
      { label: "MUD", value: analysis?.muddy_band_150_400hz ?? "--" },
      { label: "PRES", value: analysis?.presence_2k_5k ?? "--" },
      { label: "DE-ESS", value: analysis?.sibilance_5k_10k ?? "--" },
      { label: "LIMIT", value: analysis?.clipping_risk ? "RISK" : "OK" }
    ],
    [analysis]
  );

  async function requestSuggestion(text: string) {
    if (!text) return;
    const hasApiKey = configStatus?.has_api_key ?? configStatus?.has_deepseek_key;
    if (configStatus && !hasApiKey) {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "请先在右侧配置模型 API Key，再生成调音建议。" }
      ]);
      return;
    }
    const nextMessages = [...messages, { role: "user" as const, text }];
    setMessages(nextMessages);

    const res = await fetch(`${backendUrl}/ai/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        target_host: targetHost,
        workflow,
        user_goal: goal,
        user_message: text,
        analysis,
        file_analysis: fileAnalysis
      })
    });
    const data = await res.json();
    setMessages([...nextMessages, { role: "assistant", text: data.reply ?? data.error ?? "没有收到模型回复。" }]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await requestSuggestion(text);
  }

  async function generateFullPlan() {
    const hasData = analysis || fileAnalysis;
    const text = hasData
      ? "请按专业调音师流程，基于当前实时监听和/或干声伴奏分析数据，给我一套完整调试方案。需要包含插件链顺序、推荐插件类型、每个插件参数起点、试唱检查点和后续微调方向。"
      : "请先按我的目标给一套通用完整调试方案，并明确说明当前缺少实时监听或录音文件数据，哪些参数需要我试唱后再微调。";
    setGeneratingPlan(true);
    try {
      await requestSuggestion(text);
    } finally {
      setGeneratingPlan(false);
    }
  }

  async function analyzeFiles() {
    if (!vocalFile && !backingFile) return;
    setAnalyzingFiles(true);
    const form = new FormData();
    if (vocalFile) form.append("vocal", vocalFile);
    if (backingFile) form.append("backing", backingFile);

    try {
      const res = await fetch(`${backendUrl}/audio/analyze-files`, {
        method: "POST",
        body: form
      });
      const data = (await res.json()) as FileAnalysis;
      setFileAnalysis(data);
      setMessages((prev) => [
        ...prev,
        {
          role: data.error ? "system" : "assistant",
          text: data.error ?? `已分析干声/伴奏文件。${data.relation_hint ?? ""}`
        }
      ]);
    } finally {
      setAnalyzingFiles(false);
    }
  }

  async function saveApiKey() {
    const apiKey = apiKeyInput.trim();
    if (!apiKey) return;
    setSavingKey(true);
    try {
      const res = await fetch(`${backendUrl}/config/model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, base_url: baseUrlInput, model: modelInput })
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", text: data.error }]);
        return;
      }
      setApiKeyInput("");
      setConfigStatus({
        has_api_key: true,
        has_deepseek_key: true,
        base_url: data.base_url ?? baseUrlInput,
        model: data.model ?? modelInput
      });
      setMessages((prev) => [...prev, { role: "assistant", text: "模型 API Key 已保存到本机配置。" }]);
    } finally {
      setSavingKey(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="device-pane">
        <div className="brand">
          <SlidersHorizontal size={24} />
          <div>
            <h1>AI TUNING RACK</h1>
            <p>桌面 AI 调音智能体</p>
          </div>
        </div>

        <label className="field">
          <span>目标宿主</span>
          <select value={targetHost} onChange={(event) => setTargetHost(event.target.value)}>
            {hostOptions.map((host) => (
              <option key={host} value={host}>
                {host}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>监听输入</span>
          <select
            value={deviceIndex}
            onChange={(event) => setDeviceIndex(event.target.value === "" ? "" : Number(event.target.value))}
          >
            <option value="">{deviceStatus}</option>
            {devices.map((device) => (
              <option key={device.index} value={device.index}>
                {device.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>调音流程</span>
          <select value={workflow} onChange={(event) => setWorkflow(event.target.value)}>
            {workflowOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="button-row">
          <button disabled={!backendReady || deviceIndex === "" || listening} onClick={() => setListening(true)} title="开始监听">
            <Play size={18} />
            开始
          </button>
          <button disabled={!listening} onClick={() => setListening(false)} title="停止监听">
            <CircleStop size={18} />
            停止
          </button>
        </div>

        <div className="source-note">
          <Cable size={18} />
          第一版监听一个输入源。可用虚拟声卡把机架或 DAW 处理后的声音路由进来。
        </div>

        <div className="file-panel">
          <div className="mini-title">
            <FileAudio size={17} />
            <span>录音文件分析</span>
          </div>
          <label className="field">
            <span>干声 WAV</span>
            <input type="file" accept=".wav,audio/wav" onChange={(event) => setVocalFile(event.target.files?.[0] ?? null)} />
          </label>
          <label className="field">
            <span>伴奏 WAV</span>
            <input type="file" accept=".wav,audio/wav" onChange={(event) => setBackingFile(event.target.files?.[0] ?? null)} />
          </label>
          <button disabled={(!vocalFile && !backingFile) || analyzingFiles} onClick={analyzeFiles} title="分析录音">
            <FileAudio size={18} />
            {analyzingFiles ? "分析中" : "分析录音"}
          </button>
          {fileAnalysis && (
            <div className="file-summary">
              {fileAnalysis.error ? (
                fileAnalysis.error
              ) : (
                <>
                  <div>{fileAnalysis.relation_hint}</div>
                  {typeof fileAnalysis.vocal_backing_rms_delta_db === "number" && (
                    <strong>人声/伴奏差值 {fileAnalysis.vocal_backing_rms_delta_db} dB</strong>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="meter-pane">
        <div className="pane-title">
          <Mic size={21} />
          <h2>实时仪表盘</h2>
        </div>
        <div className="level-block">
          <div>
            <div className="level-value">{dbText(analysis?.peak_db ?? Number.NaN)}</div>
            <div className="level-label">PEAK INPUT</div>
          </div>
          <div className="clip-lamp" data-active={analysis?.clipping_risk ? "true" : "false"}>CLIP</div>
          <div className="meter-track">
            <div
              className="meter-fill"
              style={{ width: levelWidth(analysis?.peak_db) }}
            />
          </div>
        </div>
        <div className="strip-row">
          {channelStrips.map((strip) => (
            <div className="channel-strip" key={strip.label}>
              <div className="knob" />
              <span>{strip.label}</span>
              <strong>{strip.value}</strong>
            </div>
          ))}
        </div>
        <div className="health-grid">
          {healthItems.length === 0 ? (
            <div className="empty-state">等待监听数据</div>
          ) : (
            healthItems.map(([label, value, state]) => (
              <div className={`health-item ${state}`} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="chat-pane">
        <div className="pane-title">
          <Bot size={21} />
          <h2>AI 调音建议</h2>
        </div>
        <div className="ai-controls">
          <div className="model-badge">
            <span>模型接口</span>
            <strong>{configStatus?.model ?? "deepseek-v4-pro"}</strong>
          </div>
          <label className="field">
            <span>声音目标</span>
            <input value={goal} onChange={(event) => setGoal(event.target.value)} />
          </label>
        </div>

        <div className="api-key-panel">
          <div className={`key-status ${configStatus?.has_api_key || configStatus?.has_deepseek_key ? "ready" : "missing"}`}>
            {configStatus?.has_api_key || configStatus?.has_deepseek_key ? "模型 API Key 已配置" : "需要配置模型 API Key"}
          </div>
          {!(configStatus?.has_api_key || configStatus?.has_deepseek_key) && (
            <div className="api-key-row">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
                placeholder="粘贴 API Key，默认 DeepSeek"
              />
              <button onClick={saveApiKey} disabled={!apiKeyInput.trim() || savingKey} title="保存模型 Key">
                {savingKey ? "保存中" : "保存"}
              </button>
            </div>
          )}
          <button className="advanced-model-toggle" onClick={() => setShowAdvancedModel((value) => !value)} title="高级模型设置">
            {showAdvancedModel ? "收起高级设置" : "高级模型设置"}
          </button>
          {showAdvancedModel && (
            <div className="advanced-model-fields">
              <label className="field">
                <span>Base URL</span>
                <input value={baseUrlInput} onChange={(event) => setBaseUrlInput(event.target.value)} />
              </label>
              <label className="field">
                <span>Model</span>
                <input value={modelInput} onChange={(event) => setModelInput(event.target.value)} />
              </label>
            </div>
          )}
        </div>

        <button className="plan-button" onClick={generateFullPlan} disabled={generatingPlan} title="生成完整调试方案">
          <Sparkles size={18} />
          {generatingPlan ? "生成中" : "生成完整调试方案"}
        </button>

        <div className="messages">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
              {message.text}
            </div>
          ))}
        </div>

        <div className="composer">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="例如：现在声音太闷，想更贴耳一点，不要刺耳。"
          />
          <button onClick={sendMessage} title="发送">
            <Send size={18} />
          </button>
          <button title="保存风格">
            <Save size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
