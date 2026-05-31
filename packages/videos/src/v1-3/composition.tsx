import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { AdaptersScene } from "./adapters-scene";
import { ExistsScene } from "./exists-scene";
import { FileHandleScene } from "./file-handle-scene";
import { TIMING } from "./timings";

export const FilesSdk13: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    <Sequence
      from={TIMING.intro.from}
      durationInFrames={TIMING.intro.duration}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.3.0"
        version="v1.3"
        tagline="Now with 12 new storage adapters"
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
      from={TIMING.exists.from}
      durationInFrames={TIMING.exists.duration}
      layout="none"
    >
      <ExistsScene />
    </Sequence>
    <Sequence
      from={TIMING.fileHandle.from}
      durationInFrames={TIMING.fileHandle.duration}
      layout="none"
    >
      <FileHandleScene />
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
