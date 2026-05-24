import type { Line } from "./code";
import { CodeScene, codeSceneDuration } from "./code-scene";

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
    ["{ memory } "],
    ["from ", "kw"],
    ['"files-sdk/memory"', "str"],
    [";"],
  ],
  [],
  [["// a Map-backed store — zero deps, isomorphic, ideal for tests", "cm"]],
  [["const ", "kw"], ["adapter = "], ["memory", "at"], ["();"]],
  [
    ["const ", "kw"],
    ["files = "],
    ["new ", "kw"],
    ["Files", "tg"],
    ["({ adapter });"],
  ],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"hello.txt"', "str"],
    [", "],
    ['"hi"', "str"],
    [");"],
  ],
  [
    ["const ", "kw"],
    ["file = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["download", "at"],
    ["("],
    ['"hello.txt"', "str"],
    [");"],
  ],
  [
    ["await ", "kw"],
    ["file"],
    ["."],
    ["text", "at"],
    ["(); "],
    ['// "hi"', "cm"],
  ],
  [],
  [["// reach into the backing Map to inspect or reset", "cm"]],
  [["adapter"], ["."], ["raw", "at"], ["."], ["clear", "at"], ["();"]],
];

export const MEMORY_SCENE_DURATION = codeSceneDuration(LINES);

export const MemoryScene: React.FC = () => (
  <CodeScene
    lines={LINES}
    title="In-memory adapter."
    filename="store.test.ts"
    duration={MEMORY_SCENE_DURATION}
  />
);
