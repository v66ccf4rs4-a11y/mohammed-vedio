"""Central paths and export presets for AI-VIDEO-STUDIO."""
from __future__ import annotations

import glob
import os
import shutil
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(os.environ.get("STUDIO_ROOT", Path(__file__).resolve().parents[1]))
DIRS = {name: ROOT / name for name in (
    "input", "audio", "footage", "images", "music", "fonts", "subtitles", "scenes",
    "scripts", "templates", "projects", "previews", "output", "logs", "models")}
for _d in DIRS.values():
    _d.mkdir(parents=True, exist_ok=True)

# Keep every model/cache inside the studio (never in a cloud-only temp location).
os.environ.setdefault("HF_HOME", str(DIRS["models"] / "hf"))


@dataclass(frozen=True)
class Preset:
    name: str
    width: int
    height: int

    @property
    def vertical(self) -> bool:
        return self.height > self.width


PRESETS = {
    "tiktok": Preset("tiktok", 1080, 1920),
    "reels": Preset("reels", 1080, 1920),
    "youtube": Preset("youtube", 1920, 1080),
    "youtube4k": Preset("youtube4k", 3840, 2160),
    "vertical4k": Preset("vertical4k", 2160, 3840),
}


def find_tool(name: str, extra: list[str] | None = None) -> str | None:
    """Locate an executable on PATH or in known Windows install locations."""
    p = shutil.which(name)
    if p:
        return p
    for cand in extra or []:
        hits = sorted(glob.glob(os.path.expandvars(cand)))
        if hits:
            return hits[-1]  # newest version folder
    return None


FFMPEG = find_tool("ffmpeg", [str(ROOT / "bin" / "ffmpeg.exe")]) or "ffmpeg"
FFPROBE = find_tool("ffprobe", [str(ROOT / "bin" / "ffprobe.exe")]) or "ffprobe"
BLENDER = find_tool("blender", [
    r"%ProgramFiles%\Blender Foundation\Blender*\blender.exe",
    str(ROOT / "bin" / "blender" / "blender.exe"),
])
