import { AbsoluteFill, Audio, random, staticFile } from "remotion";
import { useT } from "../time";
import { Y } from "./kit";
import { Forty, Hidden, Heart, Outro, Pluck, Purity, Slope, Title, War, Win, World } from "./scenes";
import { YaraVerses } from "./Verses";
import { Photo, type PhotoDef } from "./Photo";

// Memories under the motion: each verse gets one photograph (Library of Congress, Matson collection).
const PHOTOS: PhotoDef[] = [
  { src: "ch53.jpg", a: 1.2, b: 10.2, focus: "50% 4%", zoom: [1.02, 1.14], strength: 0.8 },
  { src: "ch53.jpg", a: 39.6, b: 47.6, focus: "46% 2%", zoom: [1.55, 1.75], strength: 0.75 },
  { src: "gi11.jpg", a: 48.8, b: 56.2, focus: "40% 45%", zoom: [1.12, 1.04], pan: [3, -3], strength: 0.7 },
  { src: "ma5.jpg", a: 57.2, b: 66.2, focus: "55% 30%", zoom: [1.05, 1.2], strength: 0.75 },
  { src: "pa2.jpg", a: 67, b: 75, focus: "50% 50%", zoom: [1.05, 1.15], pan: [-2, 2], strength: 0.55, tone: "grey" },
  { src: "ma9.jpg", a: 76, b: 84.8, focus: "50% 22%", zoom: [1.15, 1.05], strength: 0.45 },
  { src: "ma3.jpg", a: 85.6, b: 92.6, focus: "50% 50%", zoom: [1.05, 1.18], strength: 0.7 },
  { src: "pa32.jpg", a: 96.4, b: 101.4, focus: "50% 50%", zoom: [1.05, 1.14], pan: [2, -2], strength: 0.55, tone: "grey" },
  { src: "ch48.jpg", a: 102.2, b: 110.6, focus: "45% 35%", zoom: [1.05, 1.18], strength: 0.75 },
  { src: "ch53.jpg", a: 113, b: 121.5, focus: "50% 4%", zoom: [1.2, 1.04], strength: 0.5 },
];

export const YARA_LEN = 129.9;

const Atmos: React.FC<{ t: number }> = ({ t }) => {
  const seed = Math.floor(t * 24) % 40;
  return (
    <>
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.09, mixBlendMode: "screen" }}>
        <filter id="yg">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#yg)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 35%, rgba(0,0,0,0.85) 100%)" }} />
      {/* faint drifting motes for depth */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {new Array(30).fill(0).map((_, i) => (
          <circle key={i} cx={(random(`mx${i}`) * 1920 + t * 8) % 1920} cy={(random(`my${i}`) * 1080 - t * 5 + 1080 * 30) % 1080} r={1 + random(`mr${i}`) * 1.5} fill={Y.hair} opacity={0.06 + random(`mo${i}`) * 0.12} />
        ))}
      </svg>
    </>
  );
};

export const Yara: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #1a1820 0%, ${Y.bg} 70%)` }}>
      {PHOTOS.map((p, i) => (
        <Photo key={i} p={p} t={t} />
      ))}
      <Win t={t} a={0.3} b={11.2}><Pluck t={t} draw={0.8} pluck={5.0} laugh={5.8} /></Win>
      <Win t={t} a={12} b={37.8} fin={1.5} fout={1.5}><Title t={t} /></Win>
      <Win t={t} a={39} b={48}><Pluck t={t} draw={39.0} pluck={43.1} laugh={43.9} scale={1.25} /></Win>
      <Win t={t} a={48.4} b={56.6}><Hidden t={t} /></Win>
      <Win t={t} a={56.8} b={66.6}><Heart t={t} /></Win>
      <Win t={t} a={66.6} b={75.3}><War t={t} /></Win>
      <Win t={t} a={75.6} b={85}><Forty t={t} /></Win>
      <Win t={t} a={85.2} b={92.9}><World t={t} /></Win>
      <Win t={t} a={93} b={101.6}><Slope t={t} /></Win>
      <Win t={t} a={101.8} b={112.6}><Purity t={t} /></Win>
      <Win t={t} a={111.8} b={YARA_LEN - 0.4} fin={1.2} fout={1.2}><Outro t={t} /></Win>
      <Atmos t={t} />
      <YaraVerses />
      <Audio src={staticFile("yara.mp3")} />
    </AbsoluteFill>
  );
};
