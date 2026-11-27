import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background } from "./components/Background";
import { Captions } from "./components/Captions";
import { Scene } from "./components/Scene";
import { Opening } from "./scenes/Opening";
import { Landmark } from "./scenes/Landmark";
import { Hook } from "./scenes/Hook";
import { Versus } from "./scenes/Versus";
import { MapScene } from "./scenes/MapScene";
import { Build } from "./scenes/Build";
import { Stats } from "./scenes/Stats";
import { Finale, Outro } from "./scenes/Finale";
import { C, CHANNEL, FONT_HEAD } from "./theme";
import { prog, useT } from "./time";

const ChannelBug: React.FC = () => {
  const t = useT();
  const o = prog(t, 0.3, 0.8) * (1 - prog(t, 122.4, 0.5));
  return (
    <div style={{ position: "absolute", top: 50, right: 70, display: "flex", alignItems: "center", gap: 14, direction: "rtl", opacity: 0.85 * o }}>
      <div style={{ width: 52, height: 52, borderRadius: 26, border: `3px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 26, color: C.gold }}>م</div>
      <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 28, color: C.paper }}>{CHANNEL}</div>
    </div>
  );
};

export const EiffelVideo: React.FC = () => {
  const t = useT();
  const tint = t > 34.3 && t < 41.1 ? C.red : C.gold;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background tint={tint} />
      <Scene from={0} to={17.6}><Opening /></Scene>
      <Scene from={17.7} to={33.9}><Landmark /></Scene>
      <Scene from={34.1} to={40.9}><Hook /></Scene>
      <Scene from={41.0} to={59.1}><Versus /></Scene>
      <Scene from={59.2} to={84.4}><MapScene /></Scene>
      <Scene from={84.5} to={96.4}><Build /></Scene>
      <Scene from={96.5} to={113.9}><Stats /></Scene>
      <Scene from={114.0} to={122.4}><Finale /></Scene>
      <Scene from={122.6} to={140}><Outro /></Scene>
      <ChannelBug />
      <Captions />
      <Audio src={staticFile("voice.mp3")} />
    </AbsoluteFill>
  );
};
