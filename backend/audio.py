from __future__ import annotations

import asyncio
import io
import wave
from dataclasses import dataclass
from typing import Literal

import numpy as np
import sounddevice as sd

BandState = Literal["low", "medium", "high"]


@dataclass
class AnalysisFrame:
    peak_db: float
    rms_db: float
    muddy_band_150_400hz: BandState
    sibilance_5k_10k: BandState
    presence_2k_5k: BandState
    clipping_risk: bool

    def as_dict(self) -> dict:
        return {
            "peak_db": self.peak_db,
            "rms_db": self.rms_db,
            "muddy_band_150_400hz": self.muddy_band_150_400hz,
            "sibilance_5k_10k": self.sibilance_5k_10k,
            "presence_2k_5k": self.presence_2k_5k,
            "clipping_risk": self.clipping_risk,
        }


def list_input_devices() -> list[dict]:
    devices = []
    for index, device in enumerate(sd.query_devices()):
        channels = int(device.get("max_input_channels", 0))
        if channels <= 0:
            continue
        devices.append(
            {
                "index": index,
                "name": str(device.get("name", f"Input {index}")),
                "channels": channels,
                "samplerate": int(device.get("default_samplerate", 48000)),
            }
        )
    return devices


def dbfs(value: float) -> float:
    return float(20 * np.log10(max(value, 1e-9)))


def classify_ratio(value: float, medium: float, high: float) -> BandState:
    if value >= high:
        return "high"
    if value >= medium:
        return "medium"
    return "low"


def analyze_block(samples: np.ndarray, sample_rate: int) -> AnalysisFrame:
    mono = samples.mean(axis=1) if samples.ndim > 1 else samples
    mono = np.asarray(mono, dtype=np.float32)
    peak = float(np.max(np.abs(mono))) if mono.size else 0.0
    rms = float(np.sqrt(np.mean(np.square(mono)))) if mono.size else 0.0

    windowed = mono * np.hanning(mono.size)
    spectrum = np.abs(np.fft.rfft(windowed))
    freqs = np.fft.rfftfreq(mono.size, d=1 / sample_rate)
    total = float(np.sum(spectrum) + 1e-9)

    def band_ratio(low: int, high: int) -> float:
        mask = (freqs >= low) & (freqs <= high)
        return float(np.sum(spectrum[mask]) / total)

    muddy = classify_ratio(band_ratio(150, 400), 0.08, 0.14)
    sibilance = classify_ratio(band_ratio(5000, 10000), 0.10, 0.18)
    presence = classify_ratio(band_ratio(2000, 5000), 0.09, 0.16)

    return AnalysisFrame(
        peak_db=round(dbfs(peak), 2),
        rms_db=round(dbfs(rms), 2),
        muddy_band_150_400hz=muddy,
        sibilance_5k_10k=sibilance,
        presence_2k_5k=presence,
        clipping_risk=peak >= 0.89,
    )


def read_wav_bytes(data: bytes) -> tuple[np.ndarray, int]:
    with wave.open(io.BytesIO(data), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frames = wav.readframes(wav.getnframes())

    if sample_width == 1:
        samples = np.frombuffer(frames, dtype=np.uint8).astype(np.float32)
        samples = (samples - 128.0) / 128.0
    elif sample_width == 2:
        samples = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
    elif sample_width == 3:
        raw = np.frombuffer(frames, dtype=np.uint8).reshape(-1, 3)
        signed = (
            raw[:, 0].astype(np.int32)
            | (raw[:, 1].astype(np.int32) << 8)
            | (raw[:, 2].astype(np.int32) << 16)
        )
        signed = np.where(signed & 0x800000, signed | ~0xFFFFFF, signed)
        samples = signed.astype(np.float32) / 8388608.0
    elif sample_width == 4:
        samples = np.frombuffer(frames, dtype=np.int32).astype(np.float32) / 2147483648.0
    else:
        raise ValueError(f"Unsupported WAV sample width: {sample_width}")

    if channels > 1:
        samples = samples.reshape(-1, channels)
    return samples, sample_rate


def analyze_wav_file(data: bytes, filename: str) -> dict:
    samples, sample_rate = read_wav_bytes(data)
    mono = samples.mean(axis=1) if samples.ndim > 1 else samples
    duration = round(float(mono.size / sample_rate), 2) if sample_rate else 0
    frame = analyze_block(mono, sample_rate).as_dict()
    return {
        "filename": filename,
        "sample_rate": sample_rate,
        "duration_seconds": duration,
        **frame,
    }


def analyze_vocal_and_backing(vocal: dict | None, backing: dict | None) -> dict:
    if not vocal and not backing:
        return {"summary": "未提供干声或伴奏文件。"}

    result: dict = {"vocal": vocal, "backing": backing}
    if vocal and backing:
        vocal_rms = float(vocal["rms_db"])
        backing_rms = float(backing["rms_db"])
        delta = round(vocal_rms - backing_rms, 2)
        if delta < -8:
            relation = "干声相对伴奏偏小，成品里可能被伴奏盖住。"
        elif delta > 4:
            relation = "干声相对伴奏偏大，后续可能需要压缩和空间融合。"
        else:
            relation = "干声和伴奏电平关系接近可用起点。"
        result["vocal_backing_rms_delta_db"] = delta
        result["relation_hint"] = relation
    elif vocal:
        result["relation_hint"] = "只提供了干声，可先做音色、动态、齿音和噪声诊断。"
    else:
        result["relation_hint"] = "只提供了伴奏，可先判断伴奏响度和频段拥挤情况。"

    return result


async def analysis_stream(device_index: int):
    device_info = sd.query_devices(device_index)
    sample_rate = int(device_info.get("default_samplerate", 48000))
    channels = min(2, int(device_info.get("max_input_channels", 1)))
    queue: asyncio.Queue[np.ndarray] = asyncio.Queue(maxsize=4)
    loop = asyncio.get_running_loop()

    def callback(indata, frames, time, status):
        block = indata.copy()
        loop.call_soon_threadsafe(lambda: not queue.full() and queue.put_nowait(block))

    with sd.InputStream(
        device=device_index,
        samplerate=sample_rate,
        channels=channels,
        blocksize=2048,
        callback=callback,
    ):
        while True:
            block = await queue.get()
            yield analyze_block(block, sample_rate)
