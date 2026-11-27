import { AbsoluteFill, interpolate } from "remotion";
import { Kicker, Words } from "../components/Words";
import { Tower } from "../components/Tower";
import { C, FONT_BODY, FONT_HEAD } from "../theme";
import { pop, prog, useT } from "../time";

/** 0:17–0:34 — the Eiffel Tower, tallest in the world until 1930. */
export const Landmark: React.FC = () => {
  const t = useT();
  const build = prog(t, 17.9, 3.4);
  const glow = prog(t, 20.55, 1) * (0.6 + 0.2 * Math.sin(t * 2));
  const ruler = prog(t, 22.4, 2.4);
  const meters = Math.round(interpolate(ruler, [0, 1], [0, 300]));
  const tl = prog(t, 26.6, 5.1, (x) => x);
  const TOWER_H = 780;
  return (
    <AbsoluteFill>
      {/* tower on the left */}
      <div style={{ position: "absolute", left: 170, top: 70 }}>
        <Tower build={build} height={TOWER_H} glow={glow} />
        {/* height ruler */}
        <div style={{ position: "absolute", left: TOWER_H / 2 + 40, top: 0, height: TOWER_H * 0.976, width: 120, opacity: prog(t, 22.3, 0.5) }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 3, height: `${ruler * 100}%`, background: C.goldSoft }} />
          {new Array(11).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", bottom: `${i * 10}%`, left: 0, width: i % 5 === 0 ? 30 : 16, height: 2, background: C.goldSoft, opacity: ruler * 100 >= i * 10 ? 0.9 : 0.15 }} />
          ))}
          <div style={{ position: "absolute", bottom: `calc(${ruler * 100}% - 30px)`, left: 42, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 52, color: C.paper, whiteSpace: "nowrap", direction: "rtl" }}>
            {meters} م
          </div>
        </div>
      </div>

      {/* text column on the right */}
      <div style={{ position: "absolute", right: 140, top: 150, width: 900, display: "flex", flexDirection: "column", alignItems: "flex-start", direction: "rtl", gap: 18 }}>
        <Kicker text="كان ذلك المعلم هو" at={18.9} />
        <Words text="برج إيفل" at={20.55} size={190} stagger={0.35} />
        <div style={{ height: 10 }} />
        <Words text="أعلى مبنى في العالم" at={24.2} size={76} color={C.goldSoft} weight={700} highlight={["أعلى"]} />
      </div>

      {/* timeline 1889 → 1930 (RTL: starts right) */}
      <div style={{ position: "absolute", right: 140, top: 770, width: 880, height: 120, opacity: prog(t, 25.6, 0.6) }}>
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, height: 6, borderRadius: 3, background: "rgba(243,234,216,0.15)" }} />
        <div style={{ position: "absolute", top: 40, right: 0, width: `${tl * 100}%`, height: 6, borderRadius: 3, background: `linear-gradient(270deg, ${C.gold}, ${C.red})` }} />
        <div style={{ position: "absolute", top: 60, right: -20, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: C.gold }}>1889</div>
        <div style={{ position: "absolute", top: 60, left: -20, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: tl > 0.98 ? C.paper : C.dim }}>1930</div>
        <div style={{ position: "absolute", top: 31, right: `calc(${tl * 100}% - 12px)`, width: 24, height: 24, borderRadius: 12, background: C.paper, boxShadow: `0 0 20px ${C.gold}` }} />
        <div
          style={{
            position: "absolute",
            top: 58,
            left: 110,
            transform: `scale(${pop(t, 29.35)})`,
            transformOrigin: "left center",
            padding: "6px 22px 10px",
            borderRadius: 10,
            background: `${C.red}dd`,
            fontFamily: FONT_HEAD,
            fontWeight: 700,
            fontSize: 30,
            color: C.paper,
            direction: "rtl",
            whiteSpace: "nowrap",
          }}
        >
          مئوية احتلال الجزائر
        </div>
      </div>
    </AbsoluteFill>
  );
};
