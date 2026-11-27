import { AbsoluteFill, random } from "remotion";
import { C } from "../theme";
import { useT } from "../time";

/** Dark documentary backdrop: warm gradient, drifting light, film grain, vignette. */
export const Background: React.FC<{ tint?: string }> = ({ tint = C.gold }) => {
  const t = useT();
  const lx = 50 + Math.sin(t * 0.15) * 18;
  const ly = 40 + Math.cos(t * 0.11) * 10;
  const seed = Math.floor(t * 12);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${lx}% ${ly}%, ${tint}2e 0%, ${C.bg2} 35%, ${C.bg} 75%)`,
        }}
      />
      {/* blueprint grid */}
      <AbsoluteFill
        style={{
          opacity: 0.06,
          backgroundImage: `linear-gradient(${C.paper} 1px, transparent 1px), linear-gradient(90deg, ${C.paper} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `${(t * 6) % 80}px ${(t * 3) % 80}px`,
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.13, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      {/* dust specks */}
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {new Array(40).fill(0).map((_, i) => {
          const x = (random(`x${i}`) * 1920 + t * (10 + random(`v${i}`) * 25)) % 1920;
          const y = (random(`y${i}`) * 1080 - t * (6 + random(`w${i}`) * 12) + 1080 * 4) % 1080;
          return <circle key={i} cx={x} cy={y} r={1 + random(`r${i}`) * 2} fill={C.goldSoft} opacity={0.08 + random(`o${i}`) * 0.2} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)" }} />
    </AbsoluteFill>
  );
};
