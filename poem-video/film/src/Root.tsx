import { Composition } from "remotion";
import { Film } from "./Film";
import { FPS, TOTAL } from "./theme";
import { YARA_LEN, Yara } from "./yara/Yara";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Turab" component={Film} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Yara" component={Yara} durationInFrames={Math.round(YARA_LEN * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
