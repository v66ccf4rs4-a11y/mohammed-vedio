#!/usr/bin/env python
"""AI-VIDEO-STUDIO - central orchestrator.

  python studio.py doctor                      # detect hardware + every tool, versions
  python studio.py produce input/voice.wav     # voice-over -> finished cinematic MP4
        [--script lines.txt] [--preset tiktok|reels|youtube|youtube4k|vertical4k]
        [--fps 30|60] [--title "..."] [--music music/track.mp3] [--preview]
  python studio.py test                        # full automatic test suite -> output/STUDIO-TEST.mp4
  python studio.py remotion [Composition]      # render the Remotion Arabic template
  python studio.py motion-canvas               # render the Motion Canvas template (headless)
  python studio.py blender --text "..."        # render a 3D Arabic title in Blender
  python studio.py comfyui                     # start ComfyUI (if installed)
  python studio.py menu                        # interactive Arabic/English menu
"""
from __future__ import annotations

import argparse
import importlib
import json
import os
import platform
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from studio.config import BLENDER, DIRS, FFMPEG, FFPROBE  # noqa: E402

IS_WIN = os.name == "nt"
ENVS = ROOT / "envs"
TOOLS = ROOT / "tools"


def sh(cmd, **kw) -> tuple[int, str]:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                           shell=isinstance(cmd, str), **kw)
        return r.returncode, (r.stdout + r.stderr).strip()
    except (FileNotFoundError, OSError) as e:
        return 127, str(e)


def first_line(s: str) -> str:
    return s.splitlines()[0][:100] if s else ""


def npx() -> str:
    return "npx.cmd" if IS_WIN else "npx"


def venv_python(name: str) -> Path:
    return ENVS / name / ("Scripts/python.exe" if IS_WIN else "bin/python")


def chromium_path() -> str | None:
    for c in ("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",):
        if Path(c).exists():
            return c
    return None


# ----------------------------------------------------------------------------- doctor
def hardware() -> dict:
    hw = {"os": f"{platform.system()} {platform.release()} ({platform.version()})",
          "cpu": platform.processor() or platform.machine(), "cores": os.cpu_count()}
    try:
        import psutil  # optional
        hw["ram_gb"] = round(psutil.virtual_memory().total / 2**30, 1)
    except ImportError:
        if hasattr(os, "sysconf"):
            hw["ram_gb"] = round(os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES") / 2**30, 1)
    du = shutil.disk_usage(ROOT)
    hw["disk_free_gb"] = round(du.free / 2**30, 1)
    code, out = sh(["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader"])
    if code == 0 and out:
        name, mem, drv = [x.strip() for x in out.splitlines()[0].split(",")]
        hw["gpu"] = name
        hw["vram_gb"] = round(float(mem.split()[0]) / 1024, 1)
        hw["gpu_driver"] = drv
        hw["cuda"] = True
    else:
        hw["gpu"] = "none detected (CPU mode)"
        hw["cuda"] = False
        if IS_WIN:
            c2, o2 = sh(["powershell", "-NoProfile", "-Command",
                         "(Get-CimInstance Win32_VideoController | Select -First 1).Name"])
            if c2 == 0 and o2:
                hw["gpu"] = o2.strip() + " (no CUDA)"
    vram = hw.get("vram_gb", 0)
    hw["ai_generation"] = ("SDXL/Flux-class OK" if vram >= 12 else "SD1.5/SDXL-lowvram" if vram >= 6
                           else "not recommended (procedural scenes used)")
    hw["whisper_model"] = "large-v3" if vram >= 8 else "medium" if vram >= 5 else "small"
    return hw


PY_PKGS = ["numpy", "scipy", "cv2", "PIL", "librosa", "soundfile", "pydub", "moviepy", "scenedetect",
           "faster_whisper", "ctranslate2", "arabic_reshaper", "bidi", "playwright", "torch", "torchaudio"]


def doctor(verbose=True) -> dict:
    rep = {"hardware": hardware(), "tools": {}, "python_packages": {}}
    T = rep["tools"]
    T["python"] = sys.version.split()[0]
    T["ffmpeg"] = first_line(sh([FFMPEG, "-version"])[1])
    T["ffprobe"] = first_line(sh([FFPROBE, "-version"])[1])
    c, o = sh([FFMPEG, "-hide_banner", "-filters"])
    T["ffmpeg_libass(harfbuzz)"] = "yes" if " ass " in o else "MISSING"
    T["node"] = sh(["node", "-v"])[1] or "MISSING"
    T["npm"] = sh(["npm.cmd" if IS_WIN else "npm", "-v"])[1] or "MISSING"
    T["git"] = first_line(sh(["git", "--version"])[1]) or "MISSING"
    if BLENDER:
        T["blender"] = first_line(sh([BLENDER, "-b", "--version"])[1])
    elif (ROOT.parent / ".venv-blender").exists() or importlib.util.find_spec("bpy"):
        T["blender"] = "bpy module"
    else:
        T["blender"] = "MISSING"
    rm = ROOT / "templates/remotion/node_modules/remotion/package.json"
    T["remotion"] = json.loads(rm.read_text())["version"] if rm.exists() else "MISSING (run installer)"
    mc = ROOT / "templates/motion-canvas/node_modules/@motion-canvas/core/package.json"
    T["motion-canvas"] = json.loads(mc.read_text())["version"] if mc.exists() else "MISSING (run installer)"
    T["whisperx"] = "installed (envs/whisperx)" if venv_python("whisperx").exists() else "not installed (faster-whisper used)"
    T["comfyui"] = "installed (tools/ComfyUI)" if (TOOLS / "ComfyUI/main.py").exists() else "not installed"
    T["openmontage"] = "installed (tools/OpenMontage)" if (TOOLS / "OpenMontage").exists() else "not installed"
    T["pexels_api_key"] = "set" if os.environ.get("PEXELS_API_KEY") else "not set (local footage only)"
    fonts = sorted(p.name for p in DIRS["fonts"].glob("*.ttf"))
    T["arabic_fonts"] = f"{len(fonts)} files"
    for m in PY_PKGS:
        try:
            mod = importlib.import_module(m)
            rep["python_packages"][m] = getattr(mod, "__version__", "ok")
        except Exception:  # noqa: BLE001
            rep["python_packages"][m] = "MISSING"
    if verbose:
        print("\n== Hardware ==")
        for k, v in rep["hardware"].items():
            print(f"  {k:16s} {v}")
        print("\n== Tools ==")
        for k, v in T.items():
            print(f"  {k:24s} {v}")
        print("\n== Python packages ==")
        for k, v in rep["python_packages"].items():
            print(f"  {k:16s} {v}")
    (DIRS["logs"] / "doctor.json").write_text(json.dumps(rep, indent=2, ensure_ascii=False), encoding="utf-8")
    return rep


# ----------------------------------------------------------------------------- engines
def remotion_render(comp="ArabicTitle", out: Path | None = None) -> Path:
    proj = ROOT / "templates/remotion"
    out = out or DIRS["previews"] / f"remotion-{comp}.mp4"
    cmd = [npx(), "remotion", "render", comp, str(out), "--log=error"]
    if (b := chromium_path()) and not IS_WIN:
        cmd.append(f"--browser-executable={b}")
    code, log = sh(cmd, cwd=proj)
    if code or not out.exists():
        raise RuntimeError(log[-800:])
    return out


def motion_canvas_render(out: Path | None = None) -> Path:
    proj = ROOT / "templates/motion-canvas"
    out = out or DIRS["previews"] / "motion-canvas.mp4"
    vite = subprocess.Popen([npx(), "vite", "--port", "9123", "--strictPort"], cwd=proj,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(6)
        env = dict(os.environ)
        code, log = sh(["node", "tools/render.cjs", "9123"], cwd=proj, env=env)
        if code:
            raise RuntimeError(log[-800:])
    finally:
        if IS_WIN:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(vite.pid)], capture_output=True)
        else:
            vite.kill()
    shutil.copy2(proj / "output/project.mp4", out)
    return out


def blender_render(text: str, out: Path | None = None, width=1080, height=1920, frames=90,
                   samples=32, scale=100) -> Path:
    out = out or DIRS["previews"] / "blender-title.mp4"
    frames_dir = DIRS["previews"] / "blender-frames"
    shutil.rmtree(frames_dir, ignore_errors=True)
    script = ROOT / "templates/blender/arabic_title.py"
    a = ["--text", text, "--out", str(frames_dir), "--width", str(width), "--height", str(height),
         "--frames", str(frames), "--samples", str(samples), "--scale", str(scale)]
    env = dict(os.environ)
    if BLENDER:
        env["PYTHONPATH"] = str(ENVS / "blender-site")
        code, log = sh([BLENDER, "-b", "--factory-startup", "-P", str(script), "--"] + a, env=env)
    else:
        py = ROOT.parent / ".venv-blender" / ("Scripts/python.exe" if IS_WIN else "bin/python")
        code, log = sh([str(py), str(script)] + a, env=env)
    if "BLENDER_RENDER_OK" not in log:
        raise RuntimeError(log[-1200:])
    sh([FFMPEG, "-v", "error", "-y", "-framerate", "30", "-i", str(frames_dir / "frame_%04d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(out)])
    return out


def comfyui_start():
    main = TOOLS / "ComfyUI/main.py"
    py = venv_python("comfyui")
    if not main.exists() or not py.exists():
        print("ComfyUI is not installed. Run install\\install-windows.ps1 -ComfyUI")
        return
    args = [str(py), str(main), "--listen", "127.0.0.1", "--port", "8188"]
    if not hardware().get("cuda"):
        args.append("--cpu")
    subprocess.Popen(args, cwd=main.parent)
    print("ComfyUI starting at http://127.0.0.1:8188")


# ----------------------------------------------------------------------------- tests
def run_tests() -> dict:
    from studio import audio, transcribe
    results = {}

    def check(name, fn):
        t0 = time.time()
        try:
            detail = fn()
            results[name] = {"status": "PASS", "detail": str(detail), "seconds": round(time.time() - t0, 1)}
        except Exception as e:  # noqa: BLE001
            results[name] = {"status": "FAIL", "detail": str(e)[-600:], "seconds": round(time.time() - t0, 1)}
        print(f"  [{results[name]['status']}] {name}: {results[name]['detail'][:140]}")

    print("Running AI-VIDEO-STUDIO test suite...")
    rep = doctor(verbose=False)

    def t_ffmpeg():
        out = DIRS["previews"] / "ffmpeg-test.mp4"
        code, log = sh([FFMPEG, "-v", "error", "-y", "-f", "lavfi", "-i", "testsrc2=s=1920x1080:r=60:d=2",
                        "-f", "lavfi", "-i", "sine=f=440:d=2", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-shortest", str(out)])
        if code:
            raise RuntimeError(log)
        return f"H.264/AAC 1920x1080@60 -> {out.name}"

    def t_fonts():
        out = DIRS["previews"] / "arabic-fonts.png"
        fams = ["Aref Ruqaa", "Aref Ruqaa Ink", "Amiri", "Cairo", "Tajawal", "Noto Naskh Arabic",
                "Noto Sans Arabic", "Reem Kufi", "IBM Plex Sans Arabic"]
        ass = DIRS["subtitles"] / "font-test.ass"
        lines = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1500", "",
                 "[V4+ Styles]", "Format: Name, Fontname, Fontsize, PrimaryColour, Alignment, MarginV, BorderStyle, Outline, Shadow",
                 "Style: s,Amiri,60,&H00FFFFFF,8,0,1,0,0", "", "[Events]",
                 "Format: Layer, Start, End, Style, Text"]
        for i, f in enumerate(fams):
            lines.append(f"Dialogue: 0,0:00:00.00,0:00:05.00,s,{{\\an6\\pos(1040,{80 + i * 155})\\fn{f}}}"
                         f"{f}: بِسْمِ اللهِ، شِعْرٌ عَرَبِيٌّ؛ ١٢٣ «لا» ؟")
        ass.write_text("\n".join(lines), encoding="utf-8-sig")
        code, log = sh([FFMPEG, "-v", "error", "-y", "-f", "lavfi", "-i", "color=c=0x14202e:s=1080x1500",
                        "-vf", f"ass={ass.name}:fontsdir=../fonts:shaping=complex", "-frames:v", "1", str(out)],
                       cwd=DIRS["subtitles"])
        if code:
            raise RuntimeError(log)
        return f"{len(fams)} families shaped by libass/HarfBuzz -> {out.name}"

    voice = DIRS["input"] / "voice-test.wav"

    def t_audio():
        if not voice.exists():
            raise RuntimeError("input/voice-test.wav missing")
        a = audio.analyze(voice)
        return f"{a['duration']:.2f}s {a['lufs']:.1f} LUFS quality={a['quality']}"

    def t_whisper():
        tr = transcribe.transcribe(voice, model="small")
        text = " ".join(s["text"] for s in tr["segments"])
        expect = transcribe.norm_ar("هنا تبدأ الحكاية في قلب الصحراء يشرق الضوء من جديد").split()
        got = set(transcribe.norm_ar(text).split())
        acc = sum(w in got for w in expect) / len(expect)
        if acc < 0.7:
            raise RuntimeError(f"low accuracy {acc:.0%}: {text}")
        return f"{tr['engine']} word-accuracy {acc:.0%}: {text}"

    def t_whisperx():
        py = venv_python("whisperx")
        if not py.exists():
            raise RuntimeError("WhisperX not installed (optional; Faster-Whisper is the default engine)")
        code, log = sh([str(py), "-c", "import whisperx;print('ok')"])
        if code:
            raise RuntimeError(log[-300:])
        return "import ok"

    check("ffmpeg_encode", t_ffmpeg)
    check("arabic_fonts_ffmpeg", t_fonts)
    check("audio_analysis", t_audio)
    check("arabic_transcription", t_whisper)
    check("whisperx", t_whisperx)
    check("remotion_render", lambda: remotion_render())
    check("motion_canvas_render", lambda: motion_canvas_render())
    check("blender_render", lambda: blender_render("هُنا تَبدأُ الحِكاية", width=540, height=960,
                                                   frames=2, samples=8))

    def t_comfy():
        hw = rep["hardware"]
        if not (TOOLS / "ComfyUI/main.py").exists():
            raise RuntimeError(f"not installed; hardware: {hw['ai_generation']}")
        return "installed"
    check("comfyui", t_comfy)

    def t_pipeline():
        from studio.pipeline import produce
        script = DIRS["input"] / "voice-test.txt"
        out = produce(voice, preset="tiktok", fps=30, script=script, title="استوديو الفيديو",
                      name="STUDIO-TEST", duration=10.0, lead_in=1.2)
        info = json.loads(sh([FFPROBE, "-v", "error", "-print_format", "json", "-show_streams",
                              "-show_format", str(out)])[1])
        v = next(s for s in info["streams"] if s["codec_type"] == "video")
        a = next(s for s in info["streams"] if s["codec_type"] == "audio")
        return (f"{out} {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} "
                f"{a['codec_name']} {float(info['format']['duration']):.2f}s")
    check("full_production_workflow", t_pipeline)

    rep["tests"] = results
    (DIRS["logs"] / "test-report.json").write_text(json.dumps(rep, indent=2, ensure_ascii=False), encoding="utf-8")
    ok = sum(r["status"] == "PASS" for r in results.values())
    print(f"\n{ok}/{len(results)} tests passed. Report: logs/test-report.json")
    return rep


def menu():
    while True:
        print("""
 ============ AI-VIDEO-STUDIO ============
  1) إنتاج فيديو من تسجيل صوتي   Produce video from voice-over
  2) فحص النظام والأدوات         System doctor
  3) الاختبار الشامل              Full test (STUDIO-TEST.mp4)
  4) Remotion Studio (browser editor)
  5) Motion Canvas editor
  6) ComfyUI
  7) فتح مجلد الإخراج             Open output folder
  0) خروج                          Exit
""")
        c = input(" > ").strip()
        if c == "1":
            files = sorted(p for p in DIRS["input"].iterdir() if p.suffix.lower() in
                           {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac", ".mp4"})
            for i, f in enumerate(files):
                print(f"  {i + 1}) {f.name}")
            if not files:
                print("  ضع التسجيل الصوتي في مجلد input أولاً / put a voice file in input/")
                continue
            k = int(input(" file # ") or 1) - 1
            preset = input(" preset [tiktok/youtube/youtube4k] (tiktok): ").strip() or "tiktok"
            fps = int(input(" fps [30/60] (30): ").strip() or 30)
            title = input(" title (optional): ").strip() or None
            script = files[k].with_suffix(".txt")
            from studio.pipeline import produce
            produce(files[k], preset=preset, fps=fps, title=title,
                    script=script if script.exists() else None, model=hardware()["whisper_model"])
        elif c == "2":
            doctor()
        elif c == "3":
            run_tests()
        elif c == "4":
            subprocess.Popen([npx(), "remotion", "studio"], cwd=ROOT / "templates/remotion")
        elif c == "5":
            subprocess.Popen([npx(), "vite", "--open"], cwd=ROOT / "templates/motion-canvas")
        elif c == "6":
            comfyui_start()
        elif c == "7":
            if IS_WIN:
                os.startfile(DIRS["output"])  # type: ignore[attr-defined]
            else:
                print(DIRS["output"])
        elif c == "0":
            return


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd")
    sub.add_parser("doctor")
    sub.add_parser("test")
    sub.add_parser("menu")
    sub.add_parser("comfyui")
    sub.add_parser("motion-canvas")
    r = sub.add_parser("remotion")
    r.add_argument("composition", nargs="?", default="ArabicTitle")
    b = sub.add_parser("blender")
    b.add_argument("--text", required=True)
    b.add_argument("--frames", type=int, default=90)
    p = sub.add_parser("produce")
    p.add_argument("voice")
    p.add_argument("--script")
    p.add_argument("--preset", default="tiktok")
    p.add_argument("--fps", type=int, default=30, choices=[24, 25, 30, 50, 60])
    p.add_argument("--title")
    p.add_argument("--music")
    p.add_argument("--name")
    p.add_argument("--model")
    p.add_argument("--preview", action="store_true")
    a = ap.parse_args()
    if a.cmd == "doctor":
        doctor()
    elif a.cmd == "test":
        run_tests()
    elif a.cmd == "remotion":
        print(remotion_render(a.composition))
    elif a.cmd == "motion-canvas":
        print(motion_canvas_render())
    elif a.cmd == "blender":
        print(blender_render(a.text, frames=a.frames))
    elif a.cmd == "comfyui":
        comfyui_start()
    elif a.cmd == "produce":
        from studio.pipeline import produce
        produce(a.voice, preset=a.preset, fps=a.fps, script=a.script, title=a.title, name=a.name,
                music=a.music, model=a.model or hardware()["whisper_model"],
                quality="preview" if a.preview else "final")
    else:
        menu()


if __name__ == "__main__":
    main()
