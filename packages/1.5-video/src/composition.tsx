import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "./background";
import { BulkScene } from "./bulk-scene";
import { ConvexScene } from "./convex-scene";
import { FtpScene } from "./ftp-scene";
import { IntroScene } from "./intro-scene";
import { Outro } from "./outro";
import { TIMING } from "./timings";

export const FilesSdk15: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    <Sequence
      from={TIMING.intro.from}
      durationInFrames={TIMING.intro.duration}
      layout="none"
    >
      <IntroScene />
    </Sequence>
    <Sequence
      from={TIMING.bulk.from}
      durationInFrames={TIMING.bulk.duration}
      layout="none"
    >
      <BulkScene />
    </Sequence>
    <Sequence
      from={TIMING.ftp.from}
      durationInFrames={TIMING.ftp.duration}
      layout="none"
    >
      <FtpScene />
    </Sequence>
    <Sequence
      from={TIMING.convex.from}
      durationInFrames={TIMING.convex.duration}
      layout="none"
    >
      <ConvexScene />
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
