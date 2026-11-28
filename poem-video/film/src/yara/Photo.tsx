import { AbsoluteFill, Img, staticFile } from "remotion";
import { prog } from "../time";

export type PhotoDef = {
  src: string;
  a: number; // fully visible from
  b: number; // starts fading at
  focus?: string;
  zoom?: [number, number];
  pan?: [number, number]; // x% from → to
  strength?: number; // max opacity
  tone?: "warm" | "cold" | "grey";
  /** show the whole picture centred over a blurred copy (for square/portrait photos) */
  contain?: { h: number; top: number };
};

const FADE = 1.6;

/** A photograph seen as a memory: slow drift, soft dreamy grade, dissolving edges. */
export const Photo: React.FC<{ p: PhotoDef; t: number }> = ({ p, t }) => {
  if (t < p.a - FADE || t > p.b + FADE) return null;
  const o = prog(t, p.a - FADE, FADE) * (1 - prog(t, p.b, FADE)) * (p.strength ?? 0.85);
  const k = Math.min(1, Math.max(0, (t - (p.a - FADE)) / (p.b - p.a + 2 * FADE)));
  const [z0, z1] = p.zoom ?? [1.05, 1.15];
  const [x0, x1] = p.pan ?? [0, 0];
  const tone =
    p.tone === "cold"
      ? "grayscale(1) sepia(0.25) hue-rotate(180deg) brightness(0.8) contrast(1.05)"
      : p.tone === "grey"
        ? "grayscale(1) brightness(0.85) contrast(1.05)"
        : "grayscale(1) sepia(0.55) brightness(0.92) contrast(1.06)";
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {p.contain ? (
        <>
          <AbsoluteFill style={{ transform: "scale(1.2)" }}>
            <Img src={staticFile(`yara/${p.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `${tone} blur(40px) brightness(0.55)` }} />
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: p.contain.top,
              height: p.contain.h,
              width: p.contain.h,
              transform: `translateX(-50%) scale(${z0 + (z1 - z0) * k})`,
              transformOrigin: "50% 40%",
              WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
            }}
          >
            <Img src={staticFile(`yara/${p.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: tone }} />
          </div>
        </>
      ) : (
        <AbsoluteFill style={{ transform: `scale(${z0 + (z1 - z0) * k}) translateX(${x0 + (x1 - x0) * k}%)` }}>
          <Img src={staticFile(`yara/${p.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.focus ?? "50% 40%", filter: tone }} />
        </AbsoluteFill>
      )}
      {/* dreamy bloom */}
      <AbsoluteFill style={{ backdropFilter: "blur(0px)", background: "radial-gradient(ellipse at 50% 40%, rgba(255,236,210,0.10), transparent 60%)", mixBlendMode: "screen" }} />
      {/* soft memory edges + room for verses */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 75% at 50% 42%, transparent 45%, rgba(10,10,13,0.92) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(10,10,13,0.95) 0%, rgba(10,10,13,0.7) 28%, transparent 48%)" }} />
    </AbsoluteFill>
  );
};
