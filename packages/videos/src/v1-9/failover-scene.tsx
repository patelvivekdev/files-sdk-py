import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { FAILOVER_ACTION_FRAMES, FailoverPanel } from "./failover-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ failover } "],
    ["from ", "kw"],
    ['"files-sdk/failover"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["({ "],
    ["region", "at"],
    [": "],
    ['"us-east-1"', "str"],
    [" }),"],
  ],
  [["  "], ["plugins", "at"], [": ["], ["failover", "at"], ["({"]],
  [
    ["    "],
    ["secondaries", "at"],
    [": "],
    ["s3", "at"],
    ["({ "],
    ["region", "at"],
    [": "],
    ['"eu-west-1"', "str"],
    [" }),"],
  ],
  [["  })],"]],
  [["});"]],
  [],
  [["// primary down? the next backend serves it", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["download", "at"],
    ["("],
    ['"avatar.png"', "str"],
    [");"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const FAILOVER_SCENE_DURATION =
  ACTION_START + FAILOVER_ACTION_FRAMES + DWELL + EXIT;

export const FailoverScene: React.FC = () => {
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
    [FAILOVER_SCENE_DURATION - EXIT, FAILOVER_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [FAILOVER_SCENE_DURATION - EXIT, FAILOVER_SCENE_DURATION - 2],
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
        eyebrow="Plugin · failover"
        title="Stay up when a backend goes down."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="failover.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <FailoverPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
