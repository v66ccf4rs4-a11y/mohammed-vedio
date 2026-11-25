"""Shot rendering: sources -> camera move (sub-pixel, motion-blurred) -> depth of field ->
colour grade, vignette, film grain -> x264 intermediate. Then xfade transitions."""
from __future__ import annotations

import math
import subprocess
from pathlib import Path

import cv2
import numpy as np

from .config import FFMPEG, FFPROBE
from .emotion import GRADES
from .scenes import ProceduralScene

OVERSCAN = 1.18


def ease(p: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * min(max(p, 0.0), 1.0))


# camera move -> (zoom0, zoom1, x0, x1, y0, y1, rot0, rot1)
# zoom is relative to "frame filled"; x/y are fractions (-1..1) of the free margin.
CAMERA = {
    "push_in": (1.02, 1.16, 0, 0, 0.1, -0.2, 0, 0),
    "pull_out": (1.16, 1.02, 0, 0, -0.2, 0.1, 0, 0),
    "pan_left": (1.14, 1.14, 0.9, -0.9, 0, 0, 0, 0),
    "pan_right": (1.14, 1.14, -0.9, 0.9, 0, 0, 0, 0),
    "crane_up": (1.12, 1.08, 0, 0, 0.9, -0.9, 0, 0),
    "tilt_down": (1.10, 1.14, 0, 0, -0.9, 0.9, 0, 0),
    "orbit_drift": (1.12, 1.17, -0.6, 0.6, 0.3, -0.3, -1.0, 1.0),
    "static": (1.04, 1.04, 0, 0, 0, 0, 0, 0),
}


class VideoSource:
    def __init__(self, path: Path, W: int, H: int, fps: int, start: float = 0.0):
        self.W, self.H = int(W * OVERSCAN) // 2 * 2, int(H * OVERSCAN) // 2 * 2
        vf = (f"scale={self.W}:{self.H}:force_original_aspect_ratio=increase:flags=lanczos,"
              f"crop={self.W}:{self.H},fps={fps},format=rgb24")
        self.p = subprocess.Popen([FFMPEG, "-v", "error", "-stream_loop", "-1", "-ss", f"{start:.3f}",
                                   "-i", str(path), "-an", "-vf", vf, "-f", "rawvideo", "-"],
                                  stdout=subprocess.PIPE)
        self.n = self.W * self.H * 3

    def frame(self, _t: float) -> np.ndarray:
        buf = self.p.stdout.read(self.n)
        if len(buf) < self.n:
            raise RuntimeError("video source ended")
        return np.frombuffer(buf, np.uint8).reshape(self.H, self.W, 3)

    def close(self):
        self.p.kill()


class ImageSource:
    def __init__(self, path: Path, W: int, H: int):
        img = cv2.cvtColor(cv2.imread(str(path)), cv2.COLOR_BGR2RGB)
        tw, th = int(W * OVERSCAN), int(H * OVERSCAN)
        s = max(tw / img.shape[1], th / img.shape[0])
        img = cv2.resize(img, (math.ceil(img.shape[1] * s), math.ceil(img.shape[0] * s)),
                         interpolation=cv2.INTER_LANCZOS4)
        y0, x0 = (img.shape[0] - th) // 2, (img.shape[1] - tw) // 2
        self.img = img[y0:y0 + th, x0:x0 + tw]

    def frame(self, _t):
        return self.img

    def close(self):
        pass


class ProcSource:
    """Procedural scenes are soft gradients/silhouettes: render at reduced resolution and
    upscale (film grain restores texture). quality=1.0 renders at full size."""

    def __init__(self, kind: str, W: int, H: int, seed: int, quality: float = 0.5):
        self.size = (int(W * OVERSCAN), int(H * OVERSCAN))
        self.s = ProceduralScene(kind, int(self.size[0] * quality), int(self.size[1] * quality), seed=seed)
        self.q = quality

    def frame(self, t):
        f = self.s.frame(t)
        return f if self.q == 1.0 else cv2.resize(f, self.size, interpolation=cv2.INTER_CUBIC)

    def close(self):
        pass


def _matrix(src_wh, dst_wh, zoom, x, y, rot):
    sw, sh = src_wh
    dw, dh = dst_wh
    scale = max(dw / sw, dh / sh) * zoom
    # free margin (in source pixels) on each side at this zoom, reduced for rotation
    mx = max(0.0, (sw - dw / scale) / 2 - abs(rot) * 0.012 * sw)
    my = max(0.0, (sh - dh / scale) / 2 - abs(rot) * 0.012 * sh)
    cx, cy = sw / 2 + x * mx, sh / 2 + y * my
    M = cv2.getRotationMatrix2D((cx, cy), rot, scale)
    M[0, 2] += dw / 2 - cx
    M[1, 2] += dh / 2 - cy
    return M


def _dof_mask(W, H, vertical):
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    cy = 0.5 if vertical else 0.48
    d = np.sqrt(((X / W - 0.5) * (0.8 if vertical else 1.4)) ** 2 + ((Y / H - cy) * 1.0) ** 2)
    return np.clip(1 - (d - 0.22) / 0.35, 0, 1)[..., None].astype(np.float32)


def render_shot(source, out: Path, duration: float, W: int, H: int, fps: int, camera: str,
                mood: str, dof: bool = True, motion_blur: int = 2, grain: int = 7,
                crf: int = 14) -> Path:
    s0, s1, x0, x1, y0, y1, r0, r1 = CAMERA.get(camera, CAMERA["static"])
    nframes = max(2, round(duration * fps))
    grade = GRADES.get(mood, GRADES["calm"])
    vf = f"{grade},vignette=angle=PI/4.6:mode=forward,noise=c0s={grain}:c0f=t+u,format=yuv420p"
    enc = subprocess.Popen([FFMPEG, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-vf", vf,
                            "-c:v", "libx264", "-preset", "veryfast", "-crf", str(crf), str(out)],
                           stdin=subprocess.PIPE)
    mask = _dof_mask(W, H, H > W) if dof else None
    try:
        for n in range(nframes):
            t = n / fps
            src = source.frame(t)
            sh, sw = src.shape[:2]
            acc = None
            samples = max(1, motion_blur)
            for k in range(samples):  # 180-degree shutter: sample within half a frame
                p = ease((n + 0.5 * k / samples) / (nframes - 1))
                M = _matrix((sw, sh), (W, H), s0 + (s1 - s0) * p, x0 + (x1 - x0) * p,
                            y0 + (y1 - y0) * p, r0 + (r1 - r0) * p)
                f = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR,
                                   borderMode=cv2.BORDER_REFLECT).astype(np.float32)
                acc = f if acc is None else acc + f
            img = acc / samples
            if mask is not None:
                small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
                blur = cv2.resize(cv2.GaussianBlur(small, (0, 0), 2.2), (W, H),
                                  interpolation=cv2.INTER_LINEAR)
                img = img * mask + blur * (1 - mask)
            enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
    finally:
        enc.stdin.close()
        enc.wait()
        source.close()
    if enc.returncode:
        raise RuntimeError(f"encode failed for {out}")
    return out


def duration_of(path: Path) -> float:
    return float(subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", str(path)], capture_output=True, text=True,
                                check=True).stdout.strip())


def join_with_transitions(shots: list[Path], transitions: list[str | None], cuts: list[float],
                          td: float, out: Path, fps: int) -> Path:
    """cuts[k] = timeline time where shot k+1 takes over (transition centred on it)."""
    if len(shots) == 1:
        subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(shots[0]), "-c", "copy", str(out)], check=True)
        return out
    args = [FFMPEG, "-v", "error", "-y"]
    for s in shots:
        args += ["-i", str(s)]
    chain, last = [], "0:v"
    for k in range(1, len(shots)):
        tr = transitions[k] or "dissolve"
        lbl = f"v{k}"
        chain.append(f"[{last}][{k}:v]xfade=transition={tr}:duration={td}:offset={cuts[k - 1] - td / 2:.3f}[{lbl}]")
        last = lbl
    args += ["-filter_complex", ";".join(chain), "-map", f"[{last}]", "-r", str(fps),
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", str(out)]
    subprocess.run(args, check=True)
    return out
