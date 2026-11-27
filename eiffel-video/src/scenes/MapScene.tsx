import { AbsoluteFill, random } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-50m.json";
import { Kicker, Words } from "../components/Words";
import { C, FONT_HEAD } from "../theme";
import { pop, prog, useT } from "../time";

const W = 1150;
const H = 1080;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countries = feature(world as any, (world as any).objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const projection = geoMercator().fitExtent(
  [
    [60, 110],
    [W - 60, 860],
  ],
  { type: "MultiPoint", coordinates: [[-2, 35.2], [8, 50]] },
);
const path = geoPath(projection);
const shapes = countries.features.map((f) => ({ id: String(f.id), d: path(f) ?? "" }));
const P = (lon: number, lat: number) => projection([lon, lat]) as [number, number];

const ROUINA = P(1.81, 36.24);
const ZACCAR = P(2.22, 36.33);
const PARIS = P(2.35, 48.86);
const ALGIERS = P(3.06, 36.75);
const MID = [(ROUINA[0] + ZACCAR[0]) / 2, (ROUINA[1] + ZACCAR[1]) / 2];
const ARC = `M${MID[0]} ${MID[1]} Q${MID[0] + 330} ${(MID[1] + PARIS[1]) / 2} ${PARIS[0]} ${PARIS[1]}`;
const SURVEY = new Array(26).fill(0).map((_, i) => P(-1.5 + random(`sx${i}`) * 9, 34.6 + random(`sy${i}`) * 2.1));

const Marker: React.FC<{ p: [number, number]; at: number; label: string; dx: number; dy: number; color?: string }> = ({ p, at, label, dx, dy, color = C.gold }) => {
  const t = useT();
  const s = pop(t, at);
  const ring = ((t - at) % 1.4) / 1.4;
  if (t < at) return null;
  return (
    <g>
      <circle cx={p[0]} cy={p[1]} r={10 + ring * 40} fill="none" stroke={color} strokeWidth={3} opacity={1 - ring} />
      <circle cx={p[0]} cy={p[1]} r={11 * s} fill={color} stroke={C.bg} strokeWidth={3} />
      <line x1={p[0]} y1={p[1]} x2={p[0] + dx * s} y2={p[1] + dy * s} stroke={color} strokeWidth={2} />
      <text x={p[0] + dx} y={p[1] + dy + (dy < 0 ? -12 : 40)} textAnchor="middle" fontFamily={FONT_HEAD} fontWeight={700} fontSize={34} fill={C.paper} opacity={s} direction="rtl">
        {label}
      </text>
    </g>
  );
};

/** 0:59–1:24 — Eiffel, the survey teams, the two mines and the route to Paris. */
export const MapScene: React.FC = () => {
  const t = useT();
  const algeria = prog(t, 64.9, 1);
  const france = prog(t, 59.6, 1);
  const arc = prog(t, 81.69, 2.2);
  const cam = 1.0 + (t - 59.4) * 0.0015;
  const ship = Math.max(0, Math.min(1, (arc * 1.0)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 30, top: 0, width: W, height: H, transform: `scale(${cam})`, transformOrigin: `${MID[0]}px ${MID[1]}px` }}>
        <svg width={W} height={H}>
          <defs>
            <linearGradient id="arcg" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0" stopColor={C.gold} />
              <stop offset="1" stopColor={C.red} />
            </linearGradient>
          </defs>
          {shapes.map((s) => (
            <path
              key={s.id + s.d.length}
              d={s.d}
              fill={s.id === "012" ? `rgba(212,168,86,${0.08 + 0.22 * algeria})` : s.id === "250" ? `rgba(154,161,169,${0.06 + 0.12 * france})` : "rgba(243,234,216,0.04)"}
              stroke={s.id === "012" ? C.gold : s.id === "250" ? C.iron : "rgba(243,234,216,0.22)"}
              strokeWidth={s.id === "012" || s.id === "250" ? 2.2 : 1}
            />
          ))}
          {/* labels */}
          <text x={P(2.6, 46.6)[0]} y={P(2.6, 46.6)[1]} textAnchor="middle" fontFamily={FONT_HEAD} fontWeight={900} fontSize={52} fill={C.iron} opacity={0.7 * france}>فرنسا</text>
          <text x={P(6.6, 35.8)[0]} y={P(6.6, 35.8)[1]} textAnchor="middle" fontFamily={FONT_HEAD} fontWeight={900} fontSize={48} fill={C.gold} opacity={0.85 * algeria}>الجزائر</text>
          {/* survey teams */}
          {SURVEY.map(([x, y], i) => {
            const a = 68.2 + i * 0.07;
            const s = pop(t, a, 0.5) * (1 - 0.6 * prog(t, 77.5, 0.6));
            return <rect key={i} x={x - 5} y={y - 5} width={10} height={10} transform={`rotate(45 ${x} ${y})`} fill={C.iron} opacity={0.8 * s} />;
          })}
          {t > 68 && t < 72.5 && (
            <circle cx={ALGIERS[0] - 60} cy={ALGIERS[1] + 50} r={((t - 68) % 1.5) * 220} fill="none" stroke={C.iron} strokeWidth={2} opacity={1 - ((t - 68) % 1.5) / 1.5} />
          )}
          {/* route to Paris */}
          {arc > 0 && (
            <>
              <path d={ARC} fill="none" stroke="url(#arcg)" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arc} />
              <path d={ARC} fill="none" stroke={C.paper} strokeWidth={2} strokeDasharray="4 14" opacity={0.6 * arc} strokeDashoffset={-t * 40} />
            </>
          )}
          {ship > 0 && ship < 1 && (() => {
            const tt = ship;
            const x = (1 - tt) ** 2 * MID[0] + 2 * (1 - tt) * tt * (MID[0] + 330) + tt * tt * PARIS[0];
            const y = (1 - tt) ** 2 * MID[1] + 2 * (1 - tt) * tt * ((MID[1] + PARIS[1]) / 2) + tt * tt * PARIS[1];
            return <circle cx={x} cy={y} r={14} fill={C.paper} style={{ filter: `drop-shadow(0 0 12px ${C.gold})` }} />;
          })()}
          <Marker p={ROUINA} at={77.99} label="الرويْنة" dx={-130} dy={40} />
          <Marker p={ZACCAR} at={79.13} label="زكّار" dx={90} dy={-80} />
          <Marker p={PARIS} at={83.27} label="باريس" dx={-140} dy={20} color={C.red} />
        </svg>
      </div>

      {/* text panel */}
      <div style={{ position: "absolute", right: 120, top: 200, width: 640, direction: "rtl", display: "flex", flexDirection: "column", gap: 16 }}>
        {t < 66.6 && (
          <>
            <Kicker text="مهندس برج إيفل" at={62.39} out={66.2} />
            <Words text="غوستاف إيفل" at={61.33} size={110} stagger={0.3} out={66.2} />
            <Words text="أُعجب بنقاوة حديد الجزائر" at={63.77} size={58} weight={700} color={C.goldSoft} highlight={["بنقاوة"]} out={66.2} />
          </>
        )}
        {t >= 66.5 && t < 72.6 && (
          <>
            <Kicker text="المُستكشَف من طرف" at={66.5} out={72.2} />
            <Words text="فِرق البحث عن المعادن" at={67.25} size={84} stagger={0.15} out={72.2} />
            <Words text="برفقة الجيش الفرنسي" at={70.53} size={58} weight={700} color={C.iron} out={72.2} />
          </>
        )}
        {t >= 72.5 && (
          <>
            <Kicker text="فنقلت فرنسا" at={73.3} />
            <Words text="عشرات الأطنان من الحديد" at={75.03} size={84} stagger={0.15} highlight={["الأطنان"]} />
            <Words text="من منجمَي الرويْنة وزكّار" at={77.39} size={56} weight={700} color={C.goldSoft} />
            <div style={{ height: 20 }} />
            <Words text="ليُنجَز بها برج إيفل" at={81.69} size={64} weight={900} color={C.gold} />
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
