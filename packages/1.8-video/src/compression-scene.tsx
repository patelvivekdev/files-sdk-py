import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import {
  CompressionPanel,
  COMPRESSION_ACTION_FRAMES,
} from "./compression-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [["import ", "kw"], ["{ compression }"]],
  [["  "], ["from ", "kw"], ['"files-sdk/compression"', "str"], [";"]],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [
    ["  "],
    ["plugins", "at"],
    [": ["],
    ["compression", "at"],
    ["({ "],
    ["format", "at"],
    [": "],
    ['"gzip"', "str"],
    [" })],"],
  ],
  [["});"]],
  [],
  [["// gzip on write, decompressed on read", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"logs/app.log"', "str"],
    [", text);"],
  ],
  [
    ["const ", "kw"],
    ["out = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["download", "at"],
    ["("],
    ['"logs/app.log"', "str"],
    [");"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const COMPRESSION_SCENE_DURATION =
  ACTION_START + COMPRESSION_ACTION_FRAMES + DWELL + EXIT;

export const CompressionScene: React.FC = () => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, ENTER], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterLift = interpolate(frame, [0, ENTER], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [COMPRESSION_SCENE_DURATION - EXIT, COMPRESSION_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [COMPRESSION_SCENE_DURATION - EXIT, COMPRESSION_SCENE_DURATION - 2],
    [0, -14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        flexDirection: "column",
        gap: 44,
        justifyContent: "center",
        opacity: enterOpacity * exitOpacity,
        transform: `translateY(${enterLift + exitLift}px)`,
      }}
    >
      <SceneTitle
        eyebrow="Plugin · compression"
        title="Shrink bytes at rest."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="compression.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <CompressionPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
