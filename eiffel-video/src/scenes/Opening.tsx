import { AbsoluteFill, interpolate } from "remotion";
import { Kicker, Words } from "../components/Words";
import { Tower } from "../components/Tower";
import { C, FONT_BODY } from "../theme";
import { pop, prog, useT } from "../time";

/** 0:00–0:17 — centennial of the Revolution, a landmark is born. */
export const Opening: React.FC = () => {
  const t = useT();
  const count = Math.round(interpolate(t, [2.99, 6.1], [1789, 1889], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const yearIn = pop(t, 0.9, 0.8);
  const outA = prog(t, 10.7, 0.5);
  const hit = prog(t, 6.07, 0.25) * (1 - prog(t, 6.3, 0.6));
  const bar = prog(t, 2.99, 3.1);
  return (
    <AbsoluteFill>
      {/* Part A: the year */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - outA, transform: `translateY(${-outA * 60}px)` }}>
        <div style={{ position: "absolute", top: 190 }}>
          <Kicker text="الذكرى المئوية للثورة الفرنسية" at={3.0} />
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 300,
            color: count === 1889 ? C.gold : C.paper,
            letterSpacing: 6,
            opacity: yearIn,
            transform: `scale(${0.8 + 0.2 * yearIn + hit * 0.08})`,
            textShadow: `0 0 ${40 + hit * 80}px ${C.gold}55`,
            marginTop: -40,
          }}
        >
          {count}
        </div>
        {/* timeline 1789 → 1889 */}
        <div style={{ position: "absolute", top: 690, width: 1100, height: 60, direction: "ltr", opacity: prog(t, 2.6, 0.6) }}>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 4, background: "rgba(243,234,216,0.18)" }} />
          <div style={{ position: "absolute", top: 18, left: 0, width: `${bar * 100}%`, height: 4, background: C.gold, boxShadow: `0 0 18px ${C.gold}` }} />
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: i === 0 ? -30 : 1070, top: 36, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color: i === 1 && bar >= 1 ? C.gold : C.dim }}>
              {i === 0 ? 1789 : 1889}
            </div>
          ))}
          <div style={{ position: "absolute", left: `calc(${bar * 100}% - 9px)`, top: 11, width: 18, height: 18, borderRadius: 9, background: C.gold }} />
        </div>
        <div style={{ position: "absolute", top: 800 }}>
          <Words text="احتفالٌ استثنائي" at={8.65} size={64} color={C.goldSoft} weight={700} />
        </div>
      </AbsoluteFill>

      {/* Part B: a landmark */}
      {t > 10.8 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 150, opacity: 0.18 * prog(t, 12.4, 1) }}>
            <Tower build={prog(t, 12.4, 5)} height={760} color={C.goldSoft} />
          </div>
          <div style={{ position: "absolute", top: 230 }}>
            <Kicker text="أنجزوا معلمًا أثريًا" at={12.47} />
          </div>
          <div style={{ marginTop: -60 }}>
            <Words text="أصبح أيقونة" at={14.05} size={170} highlight={["أيقونة"]} stagger={0.5} />
          </div>
          <div style={{ position: "absolute", top: 640 }}>
            <Words text="للثقافة الفرنسية" at={15.85} size={72} color={C.iron} weight={700} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
