import type { Line } from "../shared/code";
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
    ["{ neon } "],
    ["from ", "kw"],
    ['"files-sdk/neon"', "str"],
    [";"],
  ],
  [],
  [["// reads the AWS_* vars Neon injects — endpoint,", "cm"]],
  [["// region and creds resolve from the environment", "cm"]],
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["neon", "at"],
    ["({ "],
    ["bucket", "at"],
    [": "],
    ['"images"', "str"],
    [" }),"],
  ],
  [["});"]],
  [],
  [["// branchable, S3-compatible object storage", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"avatars/a.png"', "str"],
    [", file);"],
  ],
  [
    ["const ", "kw"],
    ["url = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["url", "at"],
    ["("],
    ['"avatars/a.png"', "str"],
    [", { "],
    ["expiresIn", "at"],
    [": "],
    ["300", "tg"],
    [" });"],
  ],
];

export const NEON_SCENE_DURATION = codeSceneDuration(LINES);

export const NeonScene: React.FC = () => (
  <CodeScene
    duration={NEON_SCENE_DURATION}
    eyebrow="New adapter · neon"
    filename="files.ts"
    lines={LINES}
    title="Now with Neon support."
  />
);
