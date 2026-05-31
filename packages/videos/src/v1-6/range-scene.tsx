import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import { VIDEO_ACTION_FRAMES, VideoPlayer } from "./video-player";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 36;

const LINES: Line[] = [
  [["// download just a byte range — end is inclusive", "cm"]],
  [
    ["const ", "kw"],
    ["head = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["download", "at"],
    ["("],
    ['"video.mp4"', "str"],
    [", {"],
  ],
  [
    ["  "],
    ["range", "at"],
    [": { "],
    ["start", "at"],
    [": 0, "],
    ["end", "at"],
    [": 1023 },"],
  ],
  [["});"]],
  [],
  [["// stream the next chunk as the player seeks", "cm"]],
  [
    ["const ", "kw"],
    ["chunk = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["download", "at"],
    ["("],
    ['"video.mp4"', "str"],
    [", {"],
  ],
  [["  "], ["as", "at"], [": "], ['"stream"', "str"], [","]],
  [
    ["  "],
    ["range", "at"],
    [": { "],
    ["start", "at"],
    [": offset, "],
    ["end", "at"],
    [": offset + CHUNK },"],
  ],
  [["});"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const RANGE_SCENE_DURATION =
  ACTION_START + VIDEO_ACTION_FRAMES + DWELL + EXIT;

export const RangeScene: React.FC = () => {
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
    [RANGE_SCENE_DURATION - EXIT, RANGE_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [RANGE_SCENE_DURATION - EXIT, RANGE_SCENE_DURATION - 2],
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
      <SceneTitle title="Byte ranges." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="player.ts"
          lines={LINES}
          showActiveLine={false}
          width={740}
        />
        <VideoPlayer frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
