"""Voice-over import and quality analysis (FFmpeg + NumPy/Librosa)."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import numpy as np

from .config import FFMPEG, FFPROBE


def load_mono(path: str | Path, sr: int = 16000) -> np.ndarray:
    """Decode any audio/video file to mono float32 via FFmpeg (no PyAV dependency)."""
    raw = subprocess.run(
        [FFMPEG, "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def probe(path: str | Path) -> dict:
    out = subprocess.run([FFPROBE, "-v", "error", "-print_format", "json", "-show_format",
                          "-show_streams", str(path)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def analyze(path: str | Path) -> dict:
    """Duration, loudness (EBU R128), peak, clipping, noise floor and silence ratio."""
    info = probe(path)
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    if a is None:
        raise ValueError(f"no audio stream in {path}")
    duration = float(info["format"]["duration"])
    r = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-af",
                        "loudnorm=print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    loud = json.loads(m.group(0)) if m else {}
    y = load_mono(path)
    peak = float(np.max(np.abs(y))) if y.size else 0.0
    clipped = float(np.mean(np.abs(y) > 0.999)) if y.size else 0.0
    frame = 400
    n = len(y) // frame
    rms = np.sqrt(np.mean(y[: n * frame].reshape(n, frame) ** 2, axis=1) + 1e-12) if n else np.array([1e-6])
    db = 20 * np.log10(rms)
    noise_floor = float(np.percentile(db, 10))
    silence_ratio = float(np.mean(db < noise_floor + 6))
    warnings = []
    lufs = float(loud.get("input_i", "nan"))
    if clipped > 0.001:
        warnings.append("clipping detected")
    if lufs < -30:
        warnings.append("voice is very quiet")
    if noise_floor > -45:
        warnings.append("high background noise")
    if int(a.get("sample_rate", 0)) < 22050:
        warnings.append("low sample rate")
    return {
        "file": str(path), "duration": duration, "sample_rate": int(a.get("sample_rate", 0)),
        "channels": a.get("channels"), "codec": a.get("codec_name"),
        "lufs": lufs, "true_peak": float(loud.get("input_tp", "nan")), "peak": peak,
        "clipped_ratio": clipped, "noise_floor_db": noise_floor, "silence_ratio": silence_ratio,
        "quality": "good" if not warnings else "check", "warnings": warnings,
    }
