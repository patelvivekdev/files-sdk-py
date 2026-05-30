import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import { READONLY_ACTION_FRAMES, ReadonlyPanel } from "./readonly-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 30;

const LINES: Line[] = [
  [["// lock a client to reads at construction", "cm"]],
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["({ "],
    ["bucket", "at"],
    [": "],
    ['"uploads"', "str"],
    [" }),"],
  ],
  [["  "], ["readonly", "at"], [": "], ["true", "kw"], [","]],
  [["});"]],
  [],
  [["// …or derive a view from a writable client", "cm"]],
  [["const ", "kw"], ["readOnly = files"], ["."], ["readonly", "at"], ["();"]],
  [],
  [["// reads pass", "cm"]],
  [
    ["await ", "kw"],
    ["readOnly"],
    ["."],
    ["download", "at"],
    ["("],
    ['"avatar.png"', "str"],
    [");"],
  ],
  [],
  [["// writes throw FilesError ReadOnly", "cm"]],
  [
    ["await ", "kw"],
    ["readOnly"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"avatar.png"', "str"],
    [", file);"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const READONLY_SCENE_DURATION =
  ACTION_START + READONLY_ACTION_FRAMES + DWELL + EXIT;

export const ReadonlyScene: React.FC = () => {
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
    [READONLY_SCENE_DURATION - EXIT, READONLY_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [READONLY_SCENE_DURATION - EXIT, READONLY_SCENE_DURATION - 2],
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
      <SceneTitle title="Read-only instances." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="files.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <ReadonlyPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
