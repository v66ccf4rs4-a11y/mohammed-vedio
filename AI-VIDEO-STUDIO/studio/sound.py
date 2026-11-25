"""Original, royalty-free music bed + SFX generated locally, and a voice-safe mix.

The narration is never re-encoded through dynamics/EQ: only the music is shaped and
side-chain ducked under the voice, and a transparent limiter guards against overs.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import lfilter

from .config import FFMPEG

SR = 48000
# Hijaz-flavoured scale degrees (semitones) -> evocative but not cliché
SCALES = {"hope": [0, 2, 4, 7, 9], "sorrow": [0, 1, 4, 5, 7, 8], "pride": [0, 2, 3, 7, 10],
          "nostalgia": [0, 1, 4, 5, 7, 8, 10], "tension": [0, 1, 3, 6, 7], "calm": [0, 2, 5, 7, 9]}
ROOTS = {"hope": 50, "sorrow": 45, "pride": 43, "nostalgia": 48, "tension": 41, "calm": 52}


def _hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def _pluck(freq, dur, rng):
    """Karplus-Strong plucked string (oud/qanun-like timbre)."""
    n = int(SR * dur)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period).astype(np.float32)
    out = np.empty(n, np.float32)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.4985 * (buf[i % period] + buf[(i + 1) % period])
    return out * np.exp(-np.linspace(0, 4, n)).astype(np.float32)


def music_bed(duration: float, mood: str, out: Path, seed: int = 7) -> Path:
    rng = np.random.default_rng(seed)
    n = int(SR * (duration + 1))
    t = np.arange(n, dtype=np.float32) / SR
    root = ROOTS.get(mood, 48)
    scale = SCALES.get(mood, SCALES["calm"])
    pad = np.zeros(n, np.float32)
    for semis, amp in ((0, 0.5), (7, 0.32), (12, 0.25), (scale[2] + 12, 0.16)):
        f = _hz(root + semis)
        for det in (-0.12, 0.0, 0.13):
            pad += amp * np.sin(2 * np.pi * f * (1 + det / 100) * t + rng.uniform(0, 6)).astype(np.float32)
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 7.5 - 1.5)
    pad *= swell / 4
    # gentle one-pole low-pass for warmth
    pad = lfilter([0.06], [1, -0.94], pad).astype(np.float32)
    plucks = np.zeros(n, np.float32)
    step = {"tension": 0.5, "pride": 0.75}.get(mood, 1.1)
    pos = 0.8
    while pos < duration - 0.5:
        note = root + 12 + int(rng.choice(scale))
        p = _pluck(_hz(note), 2.2, rng) * rng.uniform(0.12, 0.22)
        i = int(pos * SR)
        plucks[i:i + len(p)] += p[: max(0, n - i)]
        pos += step * rng.choice([1, 1, 0.5, 1.5])
    mix = pad * 0.8 + plucks
    fade = np.minimum(1, np.minimum(t / 1.2, np.maximum(0, (duration + 1 - t)) / 2.0))
    mix = (mix * fade / (np.max(np.abs(mix)) + 1e-9) * 0.7).astype(np.float32)
    sf.write(out, np.stack([mix, np.roll(mix, 240)], 1), SR)  # subtle stereo width
    return out


def sfx_track(duration: float, cuts: list[float], out: Path, seed: int = 11) -> Path:
    rng = np.random.default_rng(seed)
    n = int(SR * (duration + 1))
    y = np.zeros(n, np.float32)
    # opening low impact
    tt = np.arange(int(SR * 2.5)) / SR
    boom = np.sin(2 * np.pi * (48 - 14 * tt) * tt) * np.exp(-tt * 2.2)
    y[: len(boom)] += 0.55 * boom.astype(np.float32)
    for c in cuts:  # whoosh centred on each transition
        L = int(SR * 1.0)
        noise = rng.standard_normal(L).astype(np.float32)
        env = np.sin(np.linspace(0, np.pi, L)) ** 2
        # moving resonant filter by blending two smoothed versions
        k = np.linspace(0.02, 0.25, L)
        acc, sm = 0.0, np.empty(L, np.float32)
        for i in range(L):
            acc += k[i] * (noise[i] - acc)
            sm[i] = acc
        w = sm * env * 0.5
        i0 = int((c - 0.6) * SR)
        if i0 >= 0:
            y[i0:i0 + L] += w[: max(0, n - i0)]
    sf.write(out, np.stack([y, y], 1), SR)
    return out


def mix(voice: Path, music: Path | None, sfx: Path | None, duration: float, out: Path,
        voice_delay: float = 0.0, music_db: float = -17.0, sfx_db: float = -14.0) -> Path:
    args = [FFMPEG, "-v", "error", "-y", "-i", str(voice)]
    graph = [f"[0:a]aresample={SR},aformat=channel_layouts=stereo,"
             f"adelay={int(voice_delay*1000)}:all=1,apad[vo]", "[vo]asplit=2[v1][key]"]
    inputs = ["[v1]"]
    idx = 1
    if music:
        args += ["-stream_loop", "-1", "-i", str(music)]
        graph.append(f"[{idx}:a]aresample={SR},volume={music_db}dB[mraw]")
        graph.append("[mraw][key]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600:makeup=1[mus]")
        inputs.append("[mus]")
        idx += 1
    else:
        graph[-1] = "[vo]anull[v1]"
    if sfx:
        args += ["-i", str(sfx)]
        graph.append(f"[{idx}:a]aresample={SR},volume={sfx_db}dB[fx]")
        inputs.append("[fx]")
    graph.append(f"{''.join(inputs)}amix=inputs={len(inputs)}:normalize=0:duration=longest,"
                 f"atrim=0:{duration:.3f},alimiter=limit=0.94:level=disabled:attack=2:release=60[out]")
    args += ["-filter_complex", ";".join(graph), "-map", "[out]", "-c:a", "pcm_s16le", str(out)]
    subprocess.run(args, check=True)
    return out
