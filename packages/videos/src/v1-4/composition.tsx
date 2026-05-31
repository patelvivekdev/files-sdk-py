import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { AdaptersScene } from "./adapters-scene";
import { CliScene } from "./cli-scene";
import { SkillScene } from "./skill-scene";
import { TIMING } from "./timings";

export const FilesSdk14: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    <Sequence
      from={TIMING.intro.from}
      durationInFrames={TIMING.intro.duration}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.4.0"
        version="v1.4"
        tagline="9 new adapters · a CLI · agent skill file"
      />
    </Sequence>
    <Sequence
      from={TIMING.adapters.from}
      durationInFrames={TIMING.adapters.duration}
      layout="none"
    >
      <AdaptersScene />
    </Sequence>
    <Sequence
      from={TIMING.cli.from}
      durationInFrames={TIMING.cli.duration}
      layout="none"
    >
      <CliScene />
    </Sequence>
    <Sequence
      from={TIMING.skill.from}
      durationInFrames={TIMING.skill.duration}
      layout="none"
    >
      <SkillScene />
    </Sequence>
    <Sequence
      from={TIMING.outro.from}
      durationInFrames={TIMING.outro.duration}
      layout="none"
    >
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
