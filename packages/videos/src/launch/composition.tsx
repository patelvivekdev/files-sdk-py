import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";

import { Background } from "../shared/background";
import { Outro } from "../shared/outro";
import { AiScene } from "./ai-scene";
import { Browser } from "./browser";
import { buildLines, charsAtEndOfLine, STEP_LINES } from "./code";
import type { AdapterId } from "./code";
import { CodeWindow } from "./code-window";
import { InstallScene } from "./install-scene";
import { TIMING, FPS } from "./timings";

const CHARS_PER_SEC = 30;
const TYPING_START = 30;

const baseLines = buildLines("s3");

const localFrameAfterLine = (lineIdx: number): number =>
  TYPING_START +
  Math.ceil((charsAtEndOfLine(baseLines, lineIdx) / CHARS_PER_SEC) * FPS);

const STEP1_LIST_AT = localFrameAfterLine(STEP_LINES.list);
const STEP2_UPLOAD_AT = localFrameAfterLine(STEP_LINES.upload);
const STEP3_DELETE_AT = localFrameAfterLine(STEP_LINES.delete);
const STEP4_DOWNLOAD_AT = localFrameAfterLine(STEP_LINES.download);

const SCENE_DURATION = TIMING.code.duration + TIMING.cycle.duration;
const CYCLE_LOCAL_START = TIMING.code.duration;

const CodeAndBrowser: React.FC = () => {
  const frame = useCurrentFrame();

  const codeReveal = interpolate(frame, [0, 26], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });
  const codeShift = interpolate(frame, [0, 26], [-60, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });

  const browserReveal = interpolate(frame, [10, 40], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });
  const browserShift = interpolate(frame, [10, 40], [80, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(
    frame,
    [SCENE_DURATION - 18, SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitShift = interpolate(
    frame,
    [SCENE_DURATION - 18, SCENE_DURATION - 2],
    [0, -14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const inCycle = frame >= CYCLE_LOCAL_START;
  const cycleFrame = frame - CYCLE_LOCAL_START;

  let adapter: AdapterId = "s3";
  let highlightAdapter = false;
  if (inCycle) {
    if (cycleFrame < 50) {
      adapter = "r2";
    } else if (cycleFrame < 100) {
      adapter = "vercelBlob";
    } else {
      adapter = "minio";
    }
    const sinceSwap = cycleFrame % 50;
    highlightAdapter = sinceSwap < 20;
  }

  const budget = inCycle
    ? 99_999
    : Math.max(0, Math.floor(((frame - TYPING_START) * CHARS_PER_SEC) / FPS));

  return (
    <AbsoluteFill
      style={{
        opacity: exitOpacity,
        transform: `translateY(${exitShift}px)`,
      }}
    >
      <div
        style={{
          left: 110,
          opacity: codeReveal,
          position: "absolute",
          top: 140,
          transform: `translateX(${codeShift}px)`,
        }}
      >
        <CodeWindow
          adapter={adapter}
          budget={budget}
          showActiveLine={!inCycle}
          highlightAdapterLines={highlightAdapter}
        />
      </div>
      <div
        style={{
          left: 1270,
          opacity: browserReveal,
          position: "absolute",
          top: 300,
          transform: `translateX(${browserShift}px)`,
        }}
      >
        <Browser
          adapter={adapter}
          listAt={STEP1_LIST_AT}
          uploadAt={STEP2_UPLOAD_AT}
          deleteAt={STEP3_DELETE_AT}
          downloadAt={STEP4_DOWNLOAD_AT}
        />
      </div>
    </AbsoluteFill>
  );
};

export const FilesSdkLaunch: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    <Sequence
      from={TIMING.install.from}
      durationInFrames={TIMING.install.duration}
      layout="none"
    >
      <InstallScene />
    </Sequence>
    <Sequence
      from={TIMING.code.from}
      durationInFrames={SCENE_DURATION}
      layout="none"
    >
      <CodeAndBrowser />
    </Sequence>
    <Sequence
      from={TIMING.ai.from}
      durationInFrames={TIMING.ai.duration}
      layout="none"
    >
      <AiScene />
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
