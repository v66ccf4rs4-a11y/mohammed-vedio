import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Grade } from "./components/Grade";
import { Shot } from "./components/Shot";
import { Intro, Outro } from "./components/Titles";
import { Verses } from "./components/Verse";
import { SHOTS } from "./shots";
import { FPS, INTRO } from "./theme";

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SHOTS.map((s, i) => (
      <Shot key={i} s={s} />
    ))}
    <Grade />
    <Intro />
    <Verses />
    <Outro />
    <Sequence from={INTRO * FPS}>
      <Audio src={staticFile("voice.mp3")} />
    </Sequence>
  </AbsoluteFill>
);
