import { Composition, Folder } from "remotion";
import { CtaScene } from "./scenes/CtaScene";
import { IntroScene } from "./scenes/IntroScene";
import { NameScene } from "./scenes/NameScene";
import { SpecialtiesScene } from "./scenes/SpecialtiesScene";
import { VoiceIntro } from "./VoiceIntro";
import { Haneen } from "./haneen/Haneen";
import { Reel } from "./reel/Reel";

const size = { width: 1080, height: 1920, fps: 30 };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="VoiceIntro" component={VoiceIntro} durationInFrames={525} {...size} />
    <Composition id="Haneen" component={Haneen} durationInFrames={2624} width={1920} height={1080} fps={30} />
    <Composition id="VoiceReel" component={Reel} durationInFrames={5247} width={1080} height={1920} fps={30} />
    <Folder name="Scenes">
      <Composition id="Intro" component={IntroScene} durationInFrames={120} {...size} />
      <Composition id="Name" component={NameScene} durationInFrames={120} {...size} />
      <Composition id="Specialties" component={SpecialtiesScene} durationInFrames={180} {...size} />
      <Composition id="CTA" component={CtaScene} durationInFrames={150} {...size} />
    </Folder>
  </>
);
