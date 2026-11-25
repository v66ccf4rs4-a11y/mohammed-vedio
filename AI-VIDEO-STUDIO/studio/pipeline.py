"""End-to-end automated production: voice-over in -> finished MP4 in output/."""
from __future__ import annotations

import json
import subprocess
import time
from pathlib import Path

from . import audio, render, sound, sources, storyboard, transcribe, typography
from .config import DIRS, FFMPEG, PRESETS

TD = 0.8  # transition duration (s)


def _log(msg: str, fh=None):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    if fh:
        fh.write(line + "\n")
        fh.flush()


def _merge_short(lines: list[dict], min_len: float) -> list[dict]:
    out: list[dict] = []
    for ln in lines:
        if out and (ln["end"] - out[-1]["start"] < min_len * 1.6) and (out[-1]["end"] - out[-1]["start"] < min_len):
            p = out[-1]
            out[-1] = {"text": p["text"] + " " + ln["text"], "start": p["start"], "end": ln["end"],
                       "words": p.get("words", []) + ln.get("words", [])}
        else:
            out.append(dict(ln))
    return out


def produce(voice: str | Path, preset: str = "tiktok", fps: int = 30, script: str | Path | None = None,
            title: str | None = None, name: str | None = None, duration: float | None = None,
            model: str = "small", lead_in: float = 0.6, tail: float = 1.4, quality: str = "final",
            music: str | Path | None = None) -> Path:
    voice = Path(voice)
    P = PRESETS[preset]
    W, H = P.width, P.height
    if quality == "preview":
        W, H = W // 2 // 2 * 2, H // 2 // 2 * 2
    name = name or voice.stem
    proj = DIRS["projects"] / name
    work = proj / "work"
    work.mkdir(parents=True, exist_ok=True)
    log = open(DIRS["logs"] / f"{name}.log", "a", encoding="utf-8")
    t_start = time.time()

    _log(f"1/7 analysing voice-over {voice.name}", log)
    qa = audio.analyze(voice)
    _log(f"    duration {qa['duration']:.2f}s, {qa['lufs']:.1f} LUFS, quality={qa['quality']} {qa['warnings']}", log)

    _log("2/7 transcribing Arabic speech", log)
    tr = transcribe.transcribe(voice, model=model)
    transcribe.save_json(tr, proj / "transcript.json")
    _log(f"    engine {tr['engine']}: " + " / ".join(s["text"] for s in tr["segments"]), log)
    if script:
        lines_txt = [ln.strip() for ln in Path(script).read_text(encoding="utf-8-sig").splitlines() if ln.strip()]
        lines = transcribe.align_script(tr, lines_txt)
    else:
        lines = _merge_short(transcribe.sentences(tr), 1.4)
    for ln in lines:  # shift onto the video timeline
        ln["start"] += lead_in
        ln["end"] += lead_in
        for w in ln.get("words", []):
            w["start"] += lead_in
            w["end"] += lead_in
    total = duration or (qa["duration"] + lead_in + tail)
    srt = DIRS["subtitles"] / f"{name}.srt"
    srt.write_text("\n".join(f"{i+1}\n{typography._t(l['start']).replace('.', ',')}0 --> "
                             f"{typography._t(l['end']).replace('.', ',')}0\n{l['text']}\n"
                             for i, l in enumerate(lines)), encoding="utf-8")

    _log("3/7 building storyboard (emotion + setting analysis)", log)
    sb = storyboard.build(lines, total, title)
    transcribe.save_json(sb, proj / "storyboard.json")
    for s in sb["scenes"]:
        _log(f"    #{s['index']} {s['start']:.2f}-{s['end']:.2f} {s['mood']:9s} {s['scene']:9s} "
             f"{s['camera']:11s} {s['transition_in'] or '-':10s} {s['text']}", log)

    _log("4/7 sourcing visuals and rendering shots", log)
    used: set[str] = set()
    shots, cuts, trans = [], [], []
    n = len(sb["scenes"])
    for i, s in enumerate(sb["scenes"]):
        a = s["start"] - (TD / 2 if i else 0)
        b = s["end"] + (TD / 2 if i < n - 1 else 0)
        src, origin = None, "procedural"
        if (p := sources.local_match(s["query"], used, "video")) or \
           (p := sources.pexels_fetch(s["query"], P.vertical, used)):
            used.add(str(p))
            src = render.VideoSource(p, W, H, fps, sources.best_shot(p, b - a))
            origin = f"video:{p.name}"
        elif p := sources.local_match(s["query"], used, "image"):
            used.add(str(p))
            src, origin = render.ImageSource(p, W, H), f"image:{p.name}"
        else:
            gen = DIRS["scenes"] / f"{name}-{i}.png"
            if sources.comfyui_generate(s["query"], P.vertical, gen):
                src, origin = render.ImageSource(gen, W, H), "comfyui"
        if src is None:
            src = render.ProcSource(s["scene"], W, H, seed=i * 7 + 3)
        out = work / f"shot{i:03d}.mp4"
        t0 = time.time()
        render.render_shot(src, out, b - a, W, H, fps, s["camera"], s["mood"])
        s["source"] = origin
        _log(f"    shot {i}: {origin} {b - a:.2f}s ({time.time() - t0:.0f}s)", log)
        shots.append(out)
        trans.append(s["transition_in"])
        if i:
            cuts.append(s["start"])
    transcribe.save_json(sb, proj / "storyboard.json")

    _log("5/7 joining shots with transitions", log)
    picture = render.join_with_transitions(shots, trans, cuts, TD, work / "picture.mp4", fps)

    _log("6/7 animating Arabic typography", log)
    ass = typography.build_ass(sb["scenes"], W, H, DIRS["subtitles"] / f"{name}.ass", title)
    fonts_rel = Path("..") / "fonts"
    texted = work / "texted.mp4"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(picture), "-vf",
                    f"ass={ass.name}:fontsdir={fonts_rel.as_posix()}:shaping=complex",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", str(texted)],
                   check=True, cwd=ass.parent)

    _log("7/7 music, sound design, voice-safe mix and final export", log)
    moods = [s["mood"] for s in sb["scenes"]]
    mood = max(set(moods), key=moods.count)
    bed = Path(music) if music else next((m for m in sorted(DIRS["music"].iterdir())
                                         if m.suffix.lower() in {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"}), None)
    if bed is None:
        bed = sound.music_bed(total, mood, work / "music.wav")
        _log(f"    generated original {mood} music bed", log)
    else:
        _log(f"    using music file {Path(bed).name}", log)
    fx = sound.sfx_track(total, cuts, work / "sfx.wav")
    mixwav = sound.mix(voice, Path(bed), fx, total, work / "mix.wav", voice_delay=lead_in)
    out = DIRS["output"] / f"{name}.mp4"
    crf = "18" if quality == "final" else "23"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(texted), "-i", str(mixwav),
                    "-map", "0:v", "-map", "1:a", "-t", f"{total:.3f}", "-r", str(fps),
                    "-c:v", "libx264", "-profile:v", "high", "-preset", "medium", "-crf", crf,
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-movflags", "+faststart", str(out)], check=True)
    report = {"output": str(out), "preset": preset, "size": f"{W}x{H}", "fps": fps,
              "duration": total, "audio_qa": qa, "render_seconds": round(time.time() - t_start, 1)}
    (proj / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    _log(f"DONE -> {out} ({report['render_seconds']}s)", log)
    log.close()
    return out
