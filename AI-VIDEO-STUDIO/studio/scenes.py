"""Original procedural cinematic scenes generated locally (no AI model / GPU needed).

Layered parallax environments inspired by Saudi & Gulf landscapes: dunes, dawn, night
desert, Red Sea coast, oasis palms, Asir mountains, city skyline and storm.
Each scene is a function of time t -> RGB frame, with real depth (parallax + haze).
"""
from __future__ import annotations

import math

import cv2
import numpy as np

PALETTES = {
    # sky top, sky horizon, far layer, near layer, sun/moon colour  (RGB 0..1)
    "dunes": ((0.20, 0.33, 0.52), (0.86, 0.74, 0.62), (0.74, 0.55, 0.42), (0.42, 0.26, 0.17), (1.0, 0.92, 0.80)),
    "dawn": ((0.10, 0.16, 0.34), (0.95, 0.66, 0.52), (0.48, 0.34, 0.36), (0.16, 0.11, 0.13), (1.0, 0.86, 0.72)),
    "night": ((0.01, 0.02, 0.07), (0.07, 0.11, 0.22), (0.07, 0.08, 0.13), (0.02, 0.02, 0.04), (0.92, 0.94, 1.0)),
    "sea": ((0.18, 0.36, 0.58), (0.80, 0.84, 0.86), (0.13, 0.33, 0.45), (0.05, 0.18, 0.27), (1.0, 0.95, 0.86)),
    "oasis": ((0.24, 0.42, 0.62), (0.90, 0.80, 0.66), (0.70, 0.52, 0.38), (0.06, 0.08, 0.06), (1.0, 0.93, 0.82)),
    "mountains": ((0.14, 0.24, 0.40), (0.72, 0.76, 0.80), (0.42, 0.48, 0.56), (0.12, 0.15, 0.20), (1.0, 0.95, 0.88)),
    "city": ((0.04, 0.06, 0.16), (0.42, 0.30, 0.42), (0.10, 0.10, 0.16), (0.03, 0.03, 0.06), (1.0, 0.80, 0.60)),
    "storm": ((0.12, 0.13, 0.16), (0.42, 0.42, 0.44), (0.24, 0.22, 0.22), (0.08, 0.08, 0.09), (0.85, 0.88, 0.95)),
}


def _ridge(width: int, rng: np.random.Generator, base: float, amp: float, octaves=3, sharp=False):
    x = np.linspace(0, 1, width, dtype=np.float32)
    y = np.full(width, base, np.float32)
    for o in range(octaves):
        f = (2.2 ** o) * rng.uniform(0.6, 1.3) * (0.9 if sharp else 1.0)
        ph = rng.uniform(0, 2 * math.pi)
        w = np.sin(2 * math.pi * f * x + ph)
        if sharp:
            w = 1 - 2 * np.abs(w)
        y += amp / (1.7 ** o) * w
    return y


class ProceduralScene:
    def __init__(self, kind: str, width: int, height: int, seed: int = 0, overscan: float = 1.35):
        self.kind = kind if kind in PALETTES else "dunes"
        self.W, self.H = width, height
        self.LW = int(width * overscan)
        self.rng = np.random.default_rng(seed)
        top, hor, far, near, light = (np.array(c, np.float32) for c in PALETTES[self.kind])
        H, LW = height, self.LW
        self.horizon = 0.56 if height > width else 0.6
        yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
        g = np.clip(yy / self.horizon, 0, 1) ** 1.6
        self.sky = (top * (1 - g) + hor * g) * np.ones((1, width, 1), np.float32)
        # sun / moon glow
        cx, cy = width * self.rng.uniform(0.35, 0.65), H * self.horizon * (0.62 if self.kind != "night" else 0.3)
        Y, X = np.mgrid[0:H, 0:width].astype(np.float32)
        d = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2) / max(width, H)
        disk_r = 0.035 if self.kind != "storm" else 0.0
        glow = np.exp(-(d / 0.18) ** 2)[..., None] * (0.55 if self.kind not in ("storm",) else 0.15)
        disk = np.clip((disk_r - d) / 0.004, 0, 1)[..., None]
        self.sky = np.clip(self.sky + glow * light * 0.6, 0, 1)
        self.sky = self.sky * (1 - disk) + light * disk
        self.stars = None
        if self.kind in ("night", "city"):
            n = 900
            self.stars = (self.rng.uniform(0, width, n), self.rng.uniform(0, H * self.horizon, n),
                          self.rng.uniform(0.3, 1.0, n), self.rng.uniform(0, 6.28, n))
        # depth layers: (rgb image, alpha, parallax speed)
        self.layers = []
        n_layers = 4
        for k in range(n_layers):
            depth = k / (n_layers - 1)  # 0 far .. 1 near
            col = far * (1 - depth) + near * depth
            haze = (1 - depth) * 0.55
            col = col * (1 - haze) + hor * haze
            base = self.horizon + depth * (0.30 if height > width else 0.26)
            sharp = self.kind == "mountains"
            amp = (0.05 if not sharp else 0.08) * (1 - 0.4 * depth)
            if self.kind == "sea":
                amp = 0.002 if k < 3 else 0.02
            if self.kind == "city" and k == 1:
                amp = 0.0
            ridge = _ridge(LW, self.rng, base - (0.05 if sharp else 0), amp, sharp=sharp) * H
            rows = np.arange(H, dtype=np.float32)[:, None]
            alpha = np.clip((rows - ridge[None, :]) / (1.5 + 3 * (1 - depth)), 0, 1)
            # shading: lit crest -> darker valley (gives dunes volume)
            below = np.clip((rows - ridge[None, :]) / H, 0, 1)
            shade = 1 - 0.30 * np.clip(below / 0.2, 0, 1)
            slope = cv2.GaussianBlur(np.gradient(ridge)[None, :].astype(np.float32), (0, 0), 25)
            side = np.tanh(-slope * 2.0)  # +1 sun-facing flank, -1 shadow flank
            lit = 1 + 0.22 * side * np.exp(-below / 0.06)
            rgb = col[None, None, :] * (shade * lit)[..., None]
            if self.kind == "city" and k == 1:
                rgb, alpha = self._skyline(LW, H, col)
            if self.kind == "oasis" and k == 2:
                rgb, alpha = self._palms(LW, H, rgb, alpha, col * 0.55)
            blur = int((1 - depth) * 3) * 2 + 1
            if blur > 1:
                rgb = cv2.GaussianBlur(rgb, (blur, blur), 0)
            self.layers.append((rgb.astype(np.float32), alpha[..., None].astype(np.float32),
                                0.15 + depth ** 1.5 * 1.2))
        self.dust = self.rng.uniform(0, 1, (260, 4)).astype(np.float32)

    def _skyline(self, LW, H, col):
        rgb = np.zeros((H, LW, 3), np.float32) + col
        alpha = np.zeros((H, LW), np.float32)
        x = 0
        base = int(H * (self.horizon + 0.1))
        while x < LW:
            bw = int(self.rng.uniform(0.02, 0.06) * self.W)
            bh = int(self.rng.uniform(0.06, 0.32) * H * (2.2 if self.rng.random() < 0.08 else 1))
            alpha[max(0, base - bh):, x:x + bw] = 1
            for wy in range(max(0, base - bh) + 6, base, 14):
                for wx in range(x + 4, x + bw - 4, 10):
                    if self.rng.random() < 0.35:
                        rgb[wy:wy + 4, wx:wx + 3] = (1.0, 0.82, 0.55)
            x += bw + int(self.rng.uniform(0, 0.01) * self.W)
        alpha[base:, :] = 1
        return rgb, alpha

    def _palms(self, LW, H, rgb, alpha, col):
        """Date-palm silhouettes: tapered curved trunk + crown of drooping tapered fronds."""
        img = np.zeros((H, LW), np.uint8)
        for _ in range(int(LW / self.W * 3)):
            x = int(self.rng.uniform(0, LW))
            gy = int(H * (self.horizon + 0.2 + self.rng.uniform(-0.02, 0.03)))
            th = int(self.rng.uniform(0.16, 0.30) * H)
            lean = self.rng.uniform(-0.06, 0.06) * self.W
            pts = []
            for s in np.linspace(0, 1, 24):  # trunk (curved, tapering)
                px = x + lean * s * s
                w = self.W * (0.012 - 0.005 * s)
                pts.append((px, gy - th * s, w))
            left = [(px - w, py) for px, py, w in pts]
            right = [(px + w, py) for px, py, w in reversed(pts)]
            cv2.fillPoly(img, [np.array(left + right, np.int32)], 255, cv2.LINE_AA)
            tx, ty = pts[-1][0], pts[-1][1]
            for a in np.linspace(-2.9, 2.9, 13) + self.rng.uniform(-0.15, 0.15, 13):
                L = self.rng.uniform(0.09, 0.14) * self.W
                droop = 0.55 + 0.35 * abs(a) / 2.9
                cen = [(tx + L * s * math.sin(a), ty - L * s * math.cos(a) * (1 - s) + L * droop * s * s)
                       for s in np.linspace(0, 1, 14)]
                half = [self.W * 0.011 * math.sin(math.pi * min(1, s * 1.3)) * (1 - s) + 1
                        for s in np.linspace(0, 1, 14)]
                up = [(cx_ + 0, cy_ - h) for (cx_, cy_), h in zip(cen, half)]
                dn = [(cx_, cy_ + h) for (cx_, cy_), h in zip(reversed(cen), reversed(half))]
                cv2.fillPoly(img, [np.array(up + dn, np.int32)], 255, cv2.LINE_AA)
            for _k in range(5):  # date clusters
                cv2.circle(img, (int(tx + self.rng.uniform(-8, 8)), int(ty + self.rng.uniform(4, 16))),
                           max(2, self.W // 200), 255, -1, cv2.LINE_AA)
        a = img.astype(np.float32) / 255
        rgb = rgb * (1 - a[..., None]) + col * a[..., None]
        return rgb, np.maximum(alpha, a)

    def frame(self, t: float, drift: float = 1.0) -> np.ndarray:
        W, H = self.W, self.H
        out = self.sky.copy()
        if self.stars is not None:
            sx, sy, sb, sp = self.stars
            tw = sb * (0.6 + 0.4 * np.sin(t * 3 + sp))
            xi, yi = sx.astype(int) % W, sy.astype(int)
            out[yi, xi] = np.maximum(out[yi, xi], tw[:, None])
        if self.kind == "storm":
            n = cv2.resize(self.rng.random((9, 16)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
            out *= (0.85 + 0.15 * n[..., None])
        for rgb, a, speed in self.layers:
            off = (t * speed * 22 * drift) % (self.LW - W)
            i0 = int(off)
            fr = off - i0
            sl = slice(i0, i0 + W)
            c = rgb[:, sl] * (1 - fr) + rgb[:, i0 + 1:i0 + 1 + W] * fr if i0 + 1 + W <= self.LW else rgb[:, sl]
            al = a[:, sl]
            out = out * (1 - al) + c * al
        if self.kind == "sea":  # animated sun glitter on the water
            y0 = int(H * self.horizon) + 2
            band = out[y0:y0 + int(H * 0.2)]
            yy = np.arange(band.shape[0])[:, None]
            xx = np.arange(W)[None, :]
            gl = np.sin(xx * 0.07 + yy * 0.9 - t * 6) * np.sin(xx * 0.013 - t * 1.3)
            m = np.clip(gl - 0.75, 0, 1)[..., None] * 3 * np.exp(-((xx - W / 2) / (W * 0.25)) ** 2)[..., None]
            out[y0:y0 + band.shape[0]] = np.clip(band + m * 0.6, 0, 1)
        # drifting sand / dust particles (near-depth, soft)
        d = self.dust
        px = ((d[:, 0] + t * (0.02 + d[:, 2] * 0.05)) % 1) * W
        py = ((d[:, 1] + 0.01 * np.sin(t + d[:, 3] * 6)) % 1) * H
        for x, y, s in zip(px.astype(int), py.astype(int), d[:, 2]):
            if s > 0.6 and self.kind not in ("city",):
                r = 1 + int(s * 2)
                out[max(0, y - r):y + r, max(0, x - r):x + r] += 0.05 * s
        if self.kind == "storm":
            rain = (self.rng.random((H // 4, W // 4)) > 0.985).astype(np.float32)
            rain = cv2.resize(rain, (W, H), interpolation=cv2.INTER_NEAREST)
            k = np.zeros((25, 25), np.float32)
            cv2.line(k, (8, 0), (16, 24), 1.0)
            out += cv2.filter2D(rain, -1, k / k.sum())[..., None] * 0.8
        return (np.clip(out, 0, 1) * 255).astype(np.uint8)
