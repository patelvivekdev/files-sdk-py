import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { HooksScene } from "./hooks-scene";
import { MemoryScene } from "./memory-scene";
import { MethodsScene } from "./methods-scene";
import { MultipartScene } from "./multipart-scene";
import { ProgressScene } from "./progress-scene";
import { RangeScene } from "./range-scene";
import { TIMING } from "./timings";
import { TransferScene } from "./transfer-scene";

export const FilesSdk16: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background src="background-2.jpg" />
    <Sequence
      durationInFrames={TIMING.intro.duration}
      from={TIMING.intro.from}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.6.0"
        version="v1.6"
        tagline="hooks · progress · transfer · multipart · ranges"
      />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.hooks.duration}
      from={TIMING.hooks.from}
      layout="none"
    >
      <HooksScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.progress.duration}
      from={TIMING.progress.from}
      layout="none"
    >
      <ProgressScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.methods.duration}
      from={TIMING.methods.from}
      layout="none"
    >
      <MethodsScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.transfer.duration}
      from={TIMING.transfer.from}
      layout="none"
    >
      <TransferScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.memory.duration}
      from={TIMING.memory.from}
      layout="none"
    >
      <MemoryScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.multipart.duration}
      from={TIMING.multipart.from}
      layout="none"
    >
      <MultipartScene />
    </Sequence>
    <Sequence
      durationInFrames={TIMING.range.duration}
      from={TIMING.range.from}
      layout="none"
    >
      <RangeScene />
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
