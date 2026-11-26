"""Shortens the pauses in the narration.

Reads assets/vad.json (speech regions from Silero VAD, seconds) and writes:
- assets/cuts.json: the removed stretches [start, end] in original time;
- assets/narration_tight.m4a: the narration with those stretches removed (20 ms fades at each joint).

build.py maps every original time through the cuts, so scenes and captions follow.
Run: python3 tools/tighten.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "narration.mp3"
OUT = ROOT / "assets" / "narration_tight.m4a"
END = 201.5

KEEP = 0.6          # pause kept between phrases, seconds
KEEP_LAST = 1.2      # the pause before «أمي» stays longer
LEAD = 0.2           # silence kept after a phrase ends
INTRO_CUT = (3.9, 7.4)  # music intro: speech now starts ~4.1 s, leaving the title ~4 s

speech = [s for s in json.loads((ROOT / "assets" / "vad.json").read_text()) if s[0] > 7.0]
cuts = [list(INTRO_CUT)]
for k in range(len(speech) - 1):
    e, s = speech[k][1], speech[k + 1][0]
    keep = KEEP_LAST if k == len(speech) - 2 else KEEP
    if s - e > keep + 0.15:
        a, b = round(e + LEAD, 2), round(s - (keep - LEAD), 2)
        if b - a > 0.1:
            cuts.append([a, b])

keep_parts, t = [], 0.0
for a, b in cuts:
    keep_parts.append((t, a))
    t = b
keep_parts.append((t, END))

fade = 0.02
chains, labels = [], []
for i, (a, b) in enumerate(keep_parts):
    d = b - a
    chains.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d={fade},afade=t=out:st={max(0, d - fade):.3f}:d={fade}[p{i}]")
    labels.append(f"[p{i}]")
graph = ";".join(chains) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=0:a=1[out]"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(SRC), "-filter_complex", graph,
                "-map", "[out]", "-c:a", "aac", "-b:a", "192k", str(OUT)], check=True)

(ROOT / "assets" / "cuts.json").write_text(json.dumps(cuts))
removed = sum(b - a for a, b in cuts)
print(f"{len(cuts)} cuts, {removed:.1f} s removed, new length {END - removed:.1f} s")
