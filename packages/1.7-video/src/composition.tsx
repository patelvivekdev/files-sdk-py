import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "./background";
import { FoldersScene } from "./folders-scene";
import { IntroScene } from "./intro-scene";
import { Outro } from "./outro";
import { ReadonlyScene } from "./readonly-scene";
import { ResumableScene } from "./resumable-scene";
import { SyncScene } from "./sync-scene";
import { TIMING } from "./timings";

export const FilesSdk17: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    <Sequence
      durationInFrames={TIMING.intro.duration}
      from={TIMING.intro.from}
      layout="none"
    >
      <IntroScene />
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
