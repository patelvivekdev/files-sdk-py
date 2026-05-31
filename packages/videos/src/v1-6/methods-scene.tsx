import type { Line } from "../shared/code";
import { CodeScene, codeSceneDuration } from "./code-scene";

const LINES: Line[] = [
  [["// rename a key — native where the provider has one", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["move", "at"],
    ["("],
    ['"uploads/tmp-abc.png"', "str"],
    [", "],
    ['"avatars/user-123.png"', "str"],
    [");"],
  ],
  [],
  [["// or bound to a FileHandle", "cm"]],
  [
    ["const ", "kw"],
    ["tmp = files"],
    ["."],
    ["file", "at"],
    ["("],
    ['"uploads/tmp-abc.png"', "str"],
    [");"],
  ],
  [
    ["await ", "kw"],
    ["tmp"],
    ["."],
    ["moveTo", "at"],
    ["("],
    ['"avatars/user-123.png"', "str"],
    [");"],
  ],
  [],
  [["// walk every page as an async iterable", "cm"]],
  [
    ["for ", "kw"],
    ["await ", "kw"],
    ["("],
    ["const ", "kw"],
    ["file "],
    ["of ", "kw"],
    ["files"],
    ["."],
    ["listAll", "at"],
    ["({ "],
    ["prefix", "at"],
    [": "],
    ['"avatars/"', "str"],
    [" })) {"],
  ],
  [["  console"], ["."], ["log", "at"], ["(file.key, file.size);"]],
  [["}"]],
];

export const METHODS_SCENE_DURATION = codeSceneDuration(LINES);

export const MethodsScene: React.FC = () => (
  <CodeScene
    duration={METHODS_SCENE_DURATION}
    filename="files.ts"
    lines={LINES}
    title="Move and list."
  />
);
