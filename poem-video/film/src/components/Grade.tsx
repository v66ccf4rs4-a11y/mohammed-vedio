import { AbsoluteFill, random } from "remotion";
import { useT } from "../time";

/** Unifies mixed archival sources: warm sepia grade, gate flicker, grain, drifting dust, vignette. */
export const Grade: React.FC = () => {
  const t = useT();
  const flicker = 1 + (random(`f${Math.floor(t * 12)}`) - 0.5) * 0.035;
  const seed = Math.floor(t * 24) % 50;
  return (
    <>
      <AbsoluteFill style={{ background: "#7a4a1c", mixBlendMode: "soft-light", opacity: 0.55 }} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(0, 1 - flicker) * 2 }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.16, mixBlendMode: "overlay" }}>
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {new Array(70).fill(0).map((_, i) => {
          const sp = 6 + random(`v${i}`) * 18;
          const x = (random(`x${i}`) * 2100 + t * sp + Math.sin(t * 0.3 + i) * 30) % 2000 - 40;
          const y = (random(`y${i}`) * 1200 - t * (3 + random(`w${i}`) * 8) + 1200 * 20) % 1200 - 60;
          const r = 0.8 + random(`r${i}`) ** 3 * 4;
          return <circle key={i} cx={x} cy={y} r={r} fill="#f6dfb0" opacity={0.1 + random(`o${i}`) * 0.35} style={{ filter: r > 3 ? "blur(1.5px)" : undefined }} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.78) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 22%, transparent 38%)" }} />
    </>
  );
};
