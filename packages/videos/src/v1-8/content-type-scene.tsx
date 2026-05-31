import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import {
  ContentTypePanel,
  CONTENT_TYPE_ACTION_FRAMES,
} from "./content-type-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [["import ", "kw"], ["{ contentType }"]],
  [["  "], ["from ", "kw"], ['"files-sdk/content-type"', "str"], [";"]],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [
    ["  "],
    ["plugins", "at"],
    [": ["],
    ["contentType", "at"],
    ["({ "],
    ["onMismatch", "at"],
    [": "],
    ['"reject"', "str"],
    [" })],"],
  ],
  [["});"]],
  [],
  [["// magic bytes verify the declared type", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"avatar.png"', "str"],
    [", bytes, {"],
  ],
  [["  "], ["contentType", "at"], [": "], ['"image/png"', "str"], [","]],
  [["});"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const CONTENT_TYPE_SCENE_DURATION =
  ACTION_START + CONTENT_TYPE_ACTION_FRAMES + DWELL + EXIT;

export const ContentTypeScene: React.FC = () => {
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
    [CONTENT_TYPE_SCENE_DURATION - EXIT, CONTENT_TYPE_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [CONTENT_TYPE_SCENE_DURATION - EXIT, CONTENT_TYPE_SCENE_DURATION - 2],
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
        eyebrow="Plugin · contentType"
        title="Trust the bytes, not the name."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="content-type.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <ContentTypePanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
