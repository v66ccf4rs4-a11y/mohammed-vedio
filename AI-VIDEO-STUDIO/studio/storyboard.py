"""Turn timed narration lines into a cinematic storyboard (no repeats, varied pacing)."""
from __future__ import annotations

import itertools

from .emotion import analyze_text

CAMERA_MOVES = ["push_in", "pan_left", "crane_up", "pull_out", "pan_right", "orbit_drift", "tilt_down"]
TRANSITIONS = {
    "hope": ["fadewhite", "smoothleft", "dissolve"],
    "sorrow": ["fadeblack", "dissolve", "hblur"],
    "pride": ["smoothup", "circleopen", "wipeleft"],
    "nostalgia": ["dissolve", "fadegrays", "hblur"],
    "tension": ["zoomin", "fadeblack", "slideleft"],
    "calm": ["dissolve", "smoothright", "fade"],
}
FALLBACK_SCENES = ["dunes", "dawn", "oasis", "sea", "mountains", "night", "city"]
TEXT_STYLES = ["ruqaa_reveal", "naskh_rise", "kufi_focus"]


def build(lines: list[dict], total: float, title: str | None = None) -> dict:
    """lines: [{text,start,end,words}] from transcription/alignment."""
    scenes, used_scenes, used_queries = [], [], set()
    cams = itertools.cycle(CAMERA_MOVES)
    fallback = itertools.cycle(FALLBACK_SCENES)
    prev_trans = None
    for i, ln in enumerate(lines):
        a = analyze_text(ln["text"])
        start = 0.0 if i == 0 else ln["start"]
        end = lines[i + 1]["start"] if i + 1 < len(lines) else total
        scene = next((s for s in a["scenes"] if not used_scenes or s != used_scenes[-1]), None)
        if scene is None:
            scene = next(fallback)
            while used_scenes and scene == used_scenes[-1]:
                scene = next(fallback)
        used_scenes.append(scene)
        query = next((q for q in a["queries"] if q not in used_queries), None) or \
            f"saudi {scene} cinematic"
        used_queries.add(query)
        options = [t for t in TRANSITIONS[a["mood"]] if t != prev_trans]
        trans = options[i % len(options)]
        prev_trans = trans
        scenes.append({
            "index": i, "start": round(start, 3), "end": round(end, 3),
            "text": ln["text"], "words": ln.get("words", []),
            "text_start": ln["start"], "text_end": ln["end"],
            "mood": a["mood"], "query": query, "scene": scene,
            "camera": next(cams), "transition_in": None if i == 0 else trans,
            "text_style": TEXT_STYLES[i % len(TEXT_STYLES)] if i else "ruqaa_reveal",
        })
    return {"title": title, "duration": total, "scenes": scenes}
