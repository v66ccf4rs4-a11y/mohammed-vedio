import { AbsoluteFill } from "remotion";
import { Words } from "../components/Words";
import { C, FONT_HEAD } from "../theme";
import { prog, useT } from "../time";

/** 0:34–0:41 — "what the French hid": dark, tense beat. */
export const Hook: React.FC = () => {
  const t = useT();
  const zoom = 1 + (t - 34.3) * 0.012;
  const glitch = t > 37.9 && t < 38.5;
  const jx = glitch ? Math.sin(t * 90) * 10 : 0;
  const reveal = prog(t, 37.91, 0.5);
  return (
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${C.red}${glitch ? "55" : "22"} 0%, transparent 60%)` }} />
      <div style={{ transform: `scale(${zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: -80 }}>
        <Words text="ما أخفاه الفرنسيون" at={35.4} size={120} stagger={0.2} />
        <Words text="عن العالم" at={36.65} size={56} color={C.iron} weight={700} />
        <div style={{ position: "relative", marginTop: 30, opacity: reveal, transform: `translateX(${jx}px) scale(${0.9 + 0.1 * reveal})` }}>
          {glitch && (
            <>
              <div style={{ position: "absolute", inset: 0, color: "#ff2a2a", transform: "translate(8px,-4px)", opacity: 0.7, fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 200, direction: "rtl" }}>حقيقة الحديد</div>
              <div style={{ position: "absolute", inset: 0, color: "#2ad8ff", transform: "translate(-8px,4px)", opacity: 0.6, fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 200, direction: "rtl" }}>حقيقة الحديد</div>
            </>
          )}
          <div style={{ position: "relative", fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 200, direction: "rtl", color: C.gold, textShadow: `0 0 60px ${C.gold}66` }}>حقيقة الحديد</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
