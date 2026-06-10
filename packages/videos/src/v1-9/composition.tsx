import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { AuditScene } from "./audit-scene";
import { CacheScene } from "./cache-scene";
import { FailoverScene } from "./failover-scene";
import { GalleryScene } from "./gallery-scene";
import { SignedUrlScene } from "./signed-url-scene";
import { SoftDeleteScene } from "./soft-delete-scene";
import { TieringScene } from "./tiering-scene";
import { TIMING } from "./timings";
import { ZipScene } from "./zip-scene";

const SCENES = [
  { Component: GalleryScene, key: "gallery" as const },
  { Component: SoftDeleteScene, key: "softDelete" as const },
  { Component: TieringScene, key: "tiering" as const },
  { Component: FailoverScene, key: "failover" as const },
  { Component: CacheScene, key: "cache" as const },
  { Component: AuditScene, key: "audit" as const },
  { Component: SignedUrlScene, key: "signedUrl" as const },
  { Component: ZipScene, key: "zip" as const },
];

export const FilesSdk19: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background src="background-2.jpg" />
    <Sequence
      durationInFrames={TIMING.intro.duration}
      from={TIMING.intro.from}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.9.0"
        durationInFrames={TIMING.intro.duration}
        tagline="seven new plugins · now fifteen in total"
        version="v1.9"
      />
    </Sequence>
    {SCENES.map(({ Component, key }) => (
      <Sequence
        durationInFrames={TIMING[key].duration}
        from={TIMING[key].from}
        key={key}
        layout="none"
      >
        <Component />
      </Sequence>
    ))}
    <Sequence
      durationInFrames={TIMING.outro.duration}
      from={TIMING.outro.from}
      layout="none"
    >
      <Outro tagline="One API for every provider." />
    </Sequence>
  </AbsoluteFill>
);
