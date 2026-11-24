import { AbsoluteFill, random } from "remotion";

const motes = new Array(70).fill(0).map((_, i) => ({
  x: random(`mx${i}`) * 1920,
  y: random(`my${i}`) * 1080,
  size: random(`ms${i}`) < 0.15 ? 18 + random(`mb${i}`) * 30 : 2 + random(`mm${i}`) * 4,
  vy: 8 + random(`mv${i}`) * 22,
  sway: random(`mw${i}`) * Math.PI * 2,
  alpha: 0.25 + random(`ma${i}`) * 0.5,
}));

export const Dust: React.FC<{ t: number; level: number }> = ({ t, level }) => (
  <AbsoluteFill style={{ mixBlendMode: "screen" }}>
    {motes.map((m, i) => {
      const y = (((m.y - t * m.vy) % 1180) + 1180) % 1180 - 50;
      const x = m.x + Math.sin(t * 0.4 + m.sway) * 30;
      const big = m.size > 10;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: m.size,
            height: m.size,
            borderRadius: "50%",
            background: big
              ? "radial-gradient(circle, rgba(255,214,150,0.35) 0%, rgba(255,214,150,0) 70%)"
              : "rgba(255,226,180,0.9)",
            opacity: m.alpha * (big ? 0.6 + level * 0.8 : 1),
            filter: big ? "blur(2px)" : "blur(0.6px)",
          }}
        />
      );
    })}
  </AbsoluteFill>
);

export const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
    <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(frame / 2) % 24} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="960" height="540" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

export const Letterbox: React.FC<{ progress: number }> = ({ progress }) => {
  const h = 108 * progress;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: h, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: h, background: "#000" }} />
    </AbsoluteFill>
  );
};
