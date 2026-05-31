import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { FoldersScene } from "./folders-scene";
import { ReadonlyScene } from "./readonly-scene";
import { ResumableScene } from "./resumable-scene";
import { SyncScene } from "./sync-scene";
import { TIMING } from "./timings";

export const FilesSdk17: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background src="background-2.jpg" />
    <Sequence
      durationInFrames={TIMING.intro.duration}
      from={TIMING.intro.from}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.7.0"
        version="v1.7"
        tagline="resumable uploads · sync · folders · read-only"
      />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.resumable.duration}
      from={TIMING.resumable.from}
      layout="none"
    >
      <ResumableScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.sync.duration}
      from={TIMING.sync.from}
      layout="none"
    >
      <SyncScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.folders.duration}
      from={TIMING.folders.from}
      layout="none"
    >
      <FoldersScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.readonly.duration}
      from={TIMING.readonly.from}
      layout="none"
    >
      <ReadonlyScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.outro.duration}
      from={TIMING.outro.from}
      layout="none"
    >
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
