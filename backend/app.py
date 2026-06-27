from __future__ import annotations

import wave

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.ai.providers import suggest
from backend.audio import analyze_vocal_and_backing, analyze_wav_file, analysis_stream, list_input_devices
from backend.config import get_settings, set_env_values


class SuggestRequest(BaseModel):
    provider: str
    target_host: str | None = None
    workflow: str | None = None
    user_goal: str | None = None
    user_message: str
    analysis: dict | None = None
    file_analysis: dict | None = None


class ModelConfigRequest(BaseModel):
    api_key: str
    base_url: str | None = None
    model: str | None = None


app = FastAPI(title="AI Tuning Advisor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/devices")
def devices():
    return {"devices": list_input_devices()}


@app.get("/config/status")
def config_status():
    settings = get_settings()
    return {
        "has_api_key": bool(settings.external_llm_api_key),
        "has_deepseek_key": bool(settings.external_llm_api_key),
        "base_url": settings.external_llm_base_url,
        "model": settings.external_llm_model,
    }


@app.post("/config/model")
def save_model_config(request: ModelConfigRequest):
    api_key = request.api_key.strip()
    if not api_key:
        return {"error": "API Key 不能为空。"}
    base_url = (request.base_url or "https://api.deepseek.com").strip().rstrip("/")
    model = (request.model or "deepseek-v4-pro").strip()
    values = {
        "EXTERNAL_LLM_BASE_URL": base_url,
        "EXTERNAL_LLM_API_KEY": api_key,
        "EXTERNAL_LLM_MODEL": model,
    }
    set_env_values(values)
    return {"ok": True, "has_api_key": True, "base_url": base_url, "model": model}


@app.post("/config/deepseek")
def save_deepseek_config(request: ModelConfigRequest):
    return save_model_config(request)


@app.websocket("/ws/analyze")
async def analyze_socket(websocket: WebSocket, device: int):
    await websocket.accept()
    try:
        async for frame in analysis_stream(device):
            await websocket.send_json(frame.as_dict())
    except WebSocketDisconnect:
        return


@app.post("/audio/analyze-files")
async def analyze_files(
    vocal: UploadFile | None = File(default=None),
    backing: UploadFile | None = File(default=None),
):
    try:
        vocal_analysis = None
        backing_analysis = None
        if vocal:
            vocal_analysis = analyze_wav_file(await vocal.read(), vocal.filename or "vocal.wav")
        if backing:
            backing_analysis = analyze_wav_file(await backing.read(), backing.filename or "backing.wav")
        return analyze_vocal_and_backing(vocal_analysis, backing_analysis)
    except wave.Error as exc:
        return {"error": f"暂时只支持标准 WAV 文件：{exc}"}
    except Exception as exc:
        return {"error": f"音频文件分析失败：{exc}"}


@app.post("/ai/suggest")
async def ai_suggest(request: SuggestRequest):
    try:
        reply = await suggest(request.provider, request.model_dump())
        return {"reply": reply}
    except Exception as exc:
        return {"error": f"模型接口调用失败：{exc}"}
