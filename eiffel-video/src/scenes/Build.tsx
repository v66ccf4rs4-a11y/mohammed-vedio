import { AbsoluteFill, interpolate } from "remotion";
import { Kicker, Words } from "../components/Words";
import { Tower } from "../components/Tower";
import { C, FONT_BODY } from "../theme";
import { prog, useT } from "../time";

/** 1:24–1:36 — built in only two years (1887 → 1889). */
export const Build: React.FC = () => {
  const t = useT();
  const bar = prog(t, 89.75, 4.56, (x) => x);
  const build = 0.06 + 0.94 * bar;
  const months = Math.round(interpolate(bar, [0, 1], [0, 24]));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 230, top: 100, opacity: prog(t, 84.8, 0.6) }}>
        <Tower build={build} height={800} glow={bar >= 1 ? 0.7 : 0.2} />
      </div>
      <div style={{ position: "absolute", right: 140, top: 170, width: 1100, direction: "rtl", display: "flex", flexDirection: "column", gap: 10 }}>
        <Kicker text="استغرق بناء البرج" at={84.61} />
        <Words text="عامين فقط" at={86.2} size={150} stagger={0.4} style={{ flexWrap: "nowrap" }} highlight={["فقط"]} />
      </div>
      <div style={{ position: "absolute", right: 140, top: 600, width: 880, height: 220, opacity: prog(t, 87.1, 0.6) }}>
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, height: 26, borderRadius: 13, background: "rgba(243,234,216,0.1)", border: "1px solid rgba(243,234,216,0.2)" }} />
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 0,
            width: `${bar * 100}%`,
            height: 26,
            borderRadius: 13,
            background: `repeating-linear-gradient(-45deg, ${C.gold} 0 18px, ${C.goldSoft} 18px 36px)`,
            backgroundPosition: `${t * 40}px 0`,
            boxShadow: `0 0 24px ${C.gold}88`,
          }}
        />
        <div style={{ position: "absolute", top: 100, right: -10, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 56, color: C.paper, opacity: prog(t, 89.6, 0.4) }}>1887</div>
        <div style={{ position: "absolute", top: 100, left: -10, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 56, color: C.gold, opacity: prog(t, 94.2, 0.4) }}>1889</div>
        <div style={{ position: "absolute", top: -10, right: `calc(${bar * 100}% - 80px)`, width: 160, textAlign: "center", fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: C.goldSoft, direction: "rtl", opacity: prog(t, 89.75, 0.3) }}>
          {months} شهرًا
        </div>
      </div>
    </AbsoluteFill>
  );
};
