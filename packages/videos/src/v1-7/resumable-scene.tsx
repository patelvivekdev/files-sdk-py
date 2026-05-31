import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { RESUMABLE_ACTION_FRAMES, ResumablePanel } from "./resumable-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 18;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ Files, UploadControl } "],
    ["from ", "kw"],
    ['"files-sdk"', "str"],
    [";"],
  ],
  [],
  [
    ["const ", "kw"],
    ["control = "],
    ["new ", "kw"],
    ["UploadControl", "tg"],
    ["();"],
  ],
  [],
  [
    ["const ", "kw"],
    ["result = files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"backups/db.tar"', "str"],
    [", file, {"],
  ],
  [["  control,"]],
  [
    ["  "],
    ["multipart", "at"],
    [": { "],
    ["partSize", "at"],
    [": 16 * 1024 * 1024 },"],
  ],
  [["});"]],
  [],
  [
    ["control"],
    ["."],
    ["pause", "at"],
    ["();   "],
    ["// in-flight parts settle", "cm"],
  ],
  [
    ["control"],
    ["."],
    ["resume", "at"],
    ["();  "],
    ["// pick up where it left off", "cm"],
  ],
  [["await ", "kw"], ["result;"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const RESUMABLE_SCENE_DURATION =
  ACTION_START + RESUMABLE_ACTION_FRAMES + DWELL + EXIT;

export const ResumableScene: React.FC = () => {
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
    [RESUMABLE_SCENE_DURATION - EXIT, RESUMABLE_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [RESUMABLE_SCENE_DURATION - EXIT, RESUMABLE_SCENE_DURATION - 2],
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
      <SceneTitle title="Pause and resume uploads." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="upload.ts"
          lines={LINES}
          showActiveLine={false}
          width={800}
        />
        <ResumablePanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
