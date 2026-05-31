import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import { SceneTitle } from "./scene-title";
import { UsagePanel, USAGE_ACTION_FRAMES } from "./usage-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ usage } "],
    ["from ", "kw"],
    ['"files-sdk/usage"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [
    ["  "],
    ["plugins", "at"],
    [": ["],
    ["usage", "at"],
    ["({ "],
    ["group", "at"],
    [": byTenant })],"],
  ],
  [["});"]],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"acme/logo.png"', "str"],
    [", bytes);"],
  ],
  [],
  [["// { operations, bytesUp, bytesDown }", "cm"]],
  [["const ", "kw"], ["total = files"], ["."], ["usage", "at"], ["();"]],
  [
    ["const ", "kw"],
    ["perTenant = files"],
    ["."],
    ["usageByGroup", "at"],
    ["();"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const USAGE_SCENE_DURATION =
  ACTION_START + USAGE_ACTION_FRAMES + DWELL + EXIT;

export const UsageScene: React.FC = () => {
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
    [USAGE_SCENE_DURATION - EXIT, USAGE_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [USAGE_SCENE_DURATION - EXIT, USAGE_SCENE_DURATION - 2],
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
      <SceneTitle eyebrow="Plugin · usage" title="Meter every operation." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="usage.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <UsagePanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
