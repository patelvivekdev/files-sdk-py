import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import { ZIP_ACTION_FRAMES, ZipPanel } from "./zip-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ zip } "],
    ["from ", "kw"],
    ['"files-sdk/zip"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["(), "],
    ["plugins", "at"],
    [": ["],
    ["zip", "at"],
    ["()],"],
  ],
  [["});"]],
  [],
  [["// stream many keys into one archive", "cm"]],
  [
    ["const ", "kw"],
    ["archive = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["zip", "at"],
    ["({ "],
    ["prefix", "at"],
    [": "],
    ['"photos/"', "str"],
    [" });"],
  ],
  [["return ", "kw"], ["new ", "kw"], ["Response", "tg"], ["(archive);"]],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["zipTo", "at"],
    ["("],
    ['"bundle.zip"', "str"],
    [", ["],
    ['"a.txt"', "str"],
    ["]);"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const ZIP_SCENE_DURATION =
  ACTION_START + ZIP_ACTION_FRAMES + DWELL + EXIT;

export const ZipScene: React.FC = () => {
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
    [ZIP_SCENE_DURATION - EXIT, ZIP_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [ZIP_SCENE_DURATION - EXIT, ZIP_SCENE_DURATION - 2],
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
        eyebrow="Plugin · zip"
        title="Bundle objects into archives."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="zip.ts"
          lines={LINES}
          showActiveLine={false}
          width={820}
        />
        <ZipPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
