import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import { SceneTitle } from "./scene-title";
import { SearchPanel, SEARCH_ACTION_FRAMES } from "./search-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ Files } "],
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
  [],
  [
    ["const ", "kw"],
    ["files = "],
    ["new ", "kw"],
    ["Files", "tg"],
    ["({ "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["() });"],
  ],
  [],
  [["// glob, regex, substring or exact — streamed", "cm"]],
  [
    ["for ", "kw"],
    ["await ", "kw"],
    ["("],
    ["const ", "kw"],
    ["file "],
    ["of ", "kw"],
    ["files"],
    ["."],
    ["search", "at"],
    ["("],
  ],
  [["  "], ['"photos/**/*.jpg"', "str"]],
  [[")) {"]],
  [["  console"], ["."], ["log", "at"], ["(file.key, file.size);"]],
  [["}"]],
  [],
  [["// or cap the walk and collect", "cm"]],
  [
    ["const ", "kw"],
    ["recent = "],
    ["await ", "kw"],
    ["Array", "tg"],
    ["."],
    ["fromAsync", "at"],
    ["("],
  ],
  [
    ["  files"],
    ["."],
    ["search", "at"],
    ["("],
    ['"logs/*.log"', "str"],
    [", { "],
    ["maxResults", "at"],
    [": 10 })"],
  ],
  [[");"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const SEARCH_SCENE_DURATION =
  ACTION_START + SEARCH_ACTION_FRAMES + DWELL + EXIT;

export const SearchScene: React.FC = () => {
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
    [SEARCH_SCENE_DURATION - EXIT, SEARCH_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [SEARCH_SCENE_DURATION - EXIT, SEARCH_SCENE_DURATION - 2],
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
      <SceneTitle title="Find keys with search()." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="search.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <SearchPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
