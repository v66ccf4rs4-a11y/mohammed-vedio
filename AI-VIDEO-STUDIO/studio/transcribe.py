"""Arabic speech transcription with word timestamps.

Engine order: WhisperX (isolated venv envs/whisperx, forced alignment) -> Faster-Whisper.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path

from .audio import load_mono
from .config import ROOT

_AR_DIAC = re.compile(r"[ؗ-ًؚ-ْٰـ]")


def norm_ar(s: str) -> str:
    s = _AR_DIAC.sub("", s)
    s = re.sub("[إأآا]", "ا", s)
    s = s.replace("ة", "ه").replace("ى", "ي")
    return re.sub(r"[^\w\s]", "", s).strip()


def pick_device() -> tuple[str, str]:
    if os.name == "nt":  # let CTranslate2 find cuBLAS/cuDNN shipped inside the CUDA PyTorch wheel
        try:
            import importlib.util
            spec = importlib.util.find_spec("torch")
            if spec and spec.origin:
                lib = Path(spec.origin).parent / "lib"
                if lib.exists():
                    os.add_dll_directory(str(lib))
                    os.environ["PATH"] = str(lib) + os.pathsep + os.environ.get("PATH", "")
        except Exception:  # noqa: BLE001
            pass
    try:
        import ctranslate2
        if ctranslate2.get_cuda_device_count() > 0:
            return "cuda", "float16"
    except Exception:  # noqa: BLE001
        pass
    return "cpu", "int8"


def transcribe(path: str | Path, model: str = "small", language: str = "ar") -> dict:
    audio = load_mono(path)
    wx_py = ROOT / "envs" / "whisperx" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if wx_py.exists() and os.environ.get("STUDIO_ENGINE", "auto") in ("auto", "whisperx"):
        r = subprocess.run([str(wx_py), str(ROOT / "scripts" / "whisperx_run.py"), str(path), model, language],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        line = next((ln for ln in r.stdout.splitlines() if ln.startswith("WHISPERX_JSON=")), None)
        if line:
            res = json.loads(line.split("=", 1)[1])
            res["language"] = language
            return res
        print("  WhisperX failed, using Faster-Whisper:", r.stderr[-300:])
    # Faster-Whisper (core environment)
    from faster_whisper import WhisperModel
    device, ctype = pick_device()

    def run(dev, ct):
        m = WhisperModel(model, device=dev, compute_type=ct,
                         download_root=os.environ.get("STUDIO_WHISPER_DIR"))
        it, _info = m.transcribe(audio, language=language, word_timestamps=True, vad_filter=True,
                                 beam_size=5)
        return [{"start": float(s.start), "end": float(s.end), "text": s.text.strip(),
                 "words": [{"word": w.word.strip(), "start": float(w.start), "end": float(w.end)}
                           for w in (s.words or [])]} for s in it]
    try:
        segs = run(device, ctype)
    except Exception as e:  # noqa: BLE001  (e.g. missing cuDNN on Windows -> CPU fallback)
        if device == "cpu":
            raise
        print(f"  GPU transcription failed ({e}); falling back to CPU")
        device, ctype = "cpu", "int8"
        segs = run(device, ctype)
    engine = f"faster-whisper/{model}/{device}"
    return {"engine": engine, "language": language, "segments": segs}


def align_script(tr: dict, script_lines: list[str]) -> list[dict]:
    """Map user-supplied sentences / poetic lines onto the recognised word timings.

    Each script line consumes as many recognised words as it has words; timings come from
    the recogniser while the text (with diacritics) comes from the script.
    """
    words = [w for s in tr["segments"] for w in s["words"]]
    if not words:
        return []
    out, i = [], 0
    for line in script_lines:
        n = max(1, len(line.split()))
        chunk = words[i:i + n] or words[-1:]
        out.append({"text": line, "start": chunk[0]["start"], "end": chunk[-1]["end"],
                    "words": [{"word": t, "start": w["start"], "end": w["end"]}
                              for t, w in zip(line.split(), chunk + chunk[-1:] * n)]})
        i += n
    return out


def sentences(tr: dict, max_words: int = 6) -> list[dict]:
    """Split recognised speech into short on-screen lines at punctuation / pauses."""
    words = [w for s in tr["segments"] for w in s["words"]]
    lines, cur = [], []
    for k, w in enumerate(words):
        cur.append(w)
        gap = words[k + 1]["start"] - w["end"] if k + 1 < len(words) else 9
        if len(cur) >= max_words or gap > 0.45 or re.search(r"[.!?؟،,:]$", w["word"]):
            lines.append(cur)
            cur = []
    if cur:
        lines.append(cur)
    return [{"text": " ".join(w["word"] for w in ln), "start": ln[0]["start"], "end": ln[-1]["end"],
             "words": ln} for ln in lines]


def save_json(obj, path: Path) -> Path:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    return path
