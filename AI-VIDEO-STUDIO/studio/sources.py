"""Visual sources for each storyboard scene, in priority order:

1. Local footage in footage/ (filename keyword match, best shot picked with PySceneDetect)
2. Local stills in images/ (camera move applied)
3. Pexels official API (only if PEXELS_API_KEY is set; free key, attribution logged)
4. ComfyUI local generation (only if a ComfyUI server with a checkpoint is running)
5. Built-in procedural cinematic scenes (always available, fully original)
"""
from __future__ import annotations

import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

from .config import DIRS

VIDEO_EXT = {".mp4", ".mov", ".mkv", ".webm", ".m4v"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def _tokens(s: str) -> set[str]:
    return {t for t in re.split(r"[\W_]+", s.lower()) if len(t) > 2}


def best_shot(path: Path, min_len: float) -> float:
    """Return a start time inside the longest detected shot (PySceneDetect)."""
    try:
        from scenedetect import ContentDetector, detect
        shots = detect(str(path), ContentDetector(threshold=27.0))
        if shots:
            longest = max(shots, key=lambda s: (s[1] - s[0]).get_seconds())
            length = (longest[1] - longest[0]).get_seconds()
            return longest[0].get_seconds() + max(0.0, (length - min_len) / 2) * (length > min_len)
    except Exception:  # noqa: BLE001
        pass
    return 0.0


def local_match(query: str, used: set[str], kind: str) -> Path | None:
    folder, exts = (DIRS["footage"], VIDEO_EXT) if kind == "video" else (DIRS["images"], IMAGE_EXT)
    files = [p for p in folder.rglob("*") if p.suffix.lower() in exts and str(p) not in used]
    if not files:
        return None
    q = _tokens(query)
    scored = sorted(files, key=lambda p: -len(q & _tokens(p.stem)))
    best = scored[0]
    return best if q & _tokens(best.stem) else None


def pexels_fetch(query: str, vertical: bool, used: set[str]) -> Path | None:
    key = os.environ.get("PEXELS_API_KEY", "").strip()
    if not key:
        return None
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
        {"query": query, "orientation": "portrait" if vertical else "landscape",
         "per_page": 15, "size": "medium"})
    req = urllib.request.Request(url, headers={"Authorization": key, "User-Agent": "AI-VIDEO-STUDIO"})
    try:
        data = json.load(urllib.request.urlopen(req, timeout=30))
    except Exception as e:  # noqa: BLE001
        print(f"  pexels: {e}")
        return None
    dest = DIRS["footage"] / "pexels"
    dest.mkdir(exist_ok=True)
    for v in data.get("videos", []):
        out = dest / f"pexels-{v['id']}-{re.sub(r'[^a-z0-9]+', '-', query.lower())}.mp4"
        if str(out) in used:
            continue
        files = sorted((f for f in v["video_files"] if f.get("file_type") == "video/mp4" and f.get("height")),
                       key=lambda f: abs(max(f["width"], f["height"]) - 1920))
        if not files:
            continue
        if not out.exists():
            urllib.request.urlretrieve(files[0]["link"], out)
        with open(DIRS["logs"] / "pexels-attribution.txt", "a", encoding="utf-8") as fh:
            fh.write(f"{out.name}\t{v['url']}\tby {v['user']['name']} ({v['user']['url']})\n")
        return out
    return None


def comfyui_generate(prompt: str, vertical: bool, out: Path) -> Path | None:
    """Text-to-image via a local ComfyUI server (http://127.0.0.1:8188) if it has a checkpoint."""
    host = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188")
    try:
        info = json.load(urllib.request.urlopen(f"{host}/object_info/CheckpointLoaderSimple", timeout=3))
        ckpts = info["CheckpointLoaderSimple"]["input"]["required"]["ckpt_name"][0]
        if not ckpts:
            return None
    except Exception:  # noqa: BLE001
        return None
    import time
    w, h = (768, 1344) if vertical else (1344, 768)
    g = {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": ckpts[0]}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text":
              f"cinematic film still, {prompt}, Saudi Arabia, natural light, 35mm, shallow depth of field, photorealistic"}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text":
              "text, watermark, logo, cartoon, oversaturated, gold filter, blurry, deformed"}},
        "4": {"class_type": "EmptyLatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "5": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0],
              "latent_image": ["4", 0], "seed": abs(hash(prompt)) % 2**31, "steps": 25, "cfg": 6.0,
              "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": 1.0}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": "studio"}},
    }
    req = urllib.request.Request(f"{host}/prompt", data=json.dumps({"prompt": g}).encode(),
                                 headers={"Content-Type": "application/json"})
    pid = json.load(urllib.request.urlopen(req, timeout=30))["prompt_id"]
    for _ in range(600):
        hist = json.load(urllib.request.urlopen(f"{host}/history/{pid}", timeout=30))
        if pid in hist:
            img = hist[pid]["outputs"]["7"]["images"][0]
            q = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img["subfolder"], "type": "output"})
            urllib.request.urlretrieve(f"{host}/view?{q}", out)
            return out
        time.sleep(1)
    return None
