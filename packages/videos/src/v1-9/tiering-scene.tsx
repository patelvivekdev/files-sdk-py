import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import { TIERING_ACTION_FRAMES, TieringPanel } from "./tiering-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ tiering } "],
    ["from ", "kw"],
    ['"files-sdk/tiering"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["(),                "],
    ["// hot", "cm"],
  ],
  [["  "], ["plugins", "at"], [": ["], ["tiering", "at"], ["({"]],
  [
    ["    "],
    ["cold", "at"],
    [": "],
    ["r2", "at"],
    ["(),               "],
    ["// cold", "cm"],
  ],
  [["    "], ["route", "at"], [": ({ "], ["size"], [" }) =>"]],
  [
    ["      "],
    ["size"],
    [" > "],
    ["5_000_000 "],
    ["? "],
    ['"cold"', "str"],
    [" : "],
    ['"hot"', "str"],
    [","],
  ],
  [["  })],"]],
  [["});"]],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"clip.mp4"', "str"],
    [", big);"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["tier", "at"],
    ["("],
    ['"clip.mp4"', "str"],
    [", "],
    ['"hot"', "str"],
    [");"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const TIERING_SCENE_DURATION =
  ACTION_START + TIERING_ACTION_FRAMES + DWELL + EXIT;

export const TieringScene: React.FC = () => {
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
    [TIERING_SCENE_DURATION - EXIT, TIERING_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [TIERING_SCENE_DURATION - EXIT, TIERING_SCENE_DURATION - 2],
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
      <SceneTitle eyebrow="Plugin · tiering" title="Route hot and cold." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="tiering.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <TieringPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
