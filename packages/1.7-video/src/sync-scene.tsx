import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import { SceneTitle } from "./scene-title";
import { SYNC_ACTION_FRAMES, SyncPanel } from "./sync-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 24;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ Files, sync } "],
    ["from ", "kw"],
    ['"files-sdk"', "str"],
    [";"],
  ],
  [
    ["import ", "kw"],
    ["{ s3 } "],
    ["from ", "kw"],
    ['"files-sdk/s3"', "str"],
    [";"],
  ],
  [
    ["import ", "kw"],
    ["{ r2 } "],
    ["from ", "kw"],
    ['"files-sdk/r2"', "str"],
    [";"],
  ],
  [],
  [
    ["const ", "kw"],
    ["from = "],
    ["new ", "kw"],
    ["Files", "tg"],
    ["({ "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["() });"],
  ],
  [
    ["const ", "kw"],
    ["to = "],
    ["new ", "kw"],
    ["Files", "tg"],
    ["({ "],
    ["adapter", "at"],
    [": "],
    ["r2", "at"],
    ["() });"],
  ],
  [],
  [["// incremental mirror — only the delta moves", "cm"]],
  [
    ["const ", "kw"],
    ["result = "],
    ["await ", "kw"],
    ["sync", "at"],
    ["(from, to, {"],
  ],
  [["  "], ["prefix", "at"], [": "], ['"uploads/"', "str"], [","]],
  [
    ["  "],
    ["prune", "at"],
    [": "],
    ["true", "kw"],
    [",      "],
    ["// prune dropped keys", "cm"],
  ],
  [
    ["  "],
    ["compare", "at"],
    [": "],
    ['"size"', "str"],
    [",  "],
    ["// cross-provider compare", "cm"],
  ],
  [["});"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const SYNC_SCENE_DURATION =
  ACTION_START + SYNC_ACTION_FRAMES + DWELL + EXIT;

export const SyncScene: React.FC = () => {
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
    [SYNC_SCENE_DURATION - EXIT, SYNC_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [SYNC_SCENE_DURATION - EXIT, SYNC_SCENE_DURATION - 2],
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
      <SceneTitle title="Mirror with sync." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="backup.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <SyncPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
