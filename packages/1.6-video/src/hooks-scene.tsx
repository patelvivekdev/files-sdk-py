import type { Line } from "./code";
import { CodeScene, codeSceneDuration } from "./code-scene";

const LINES: Line[] = [
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["({ "],
    ["bucket", "at"],
    [": "],
    ['"uploads"', "str"],
    [" }),"],
  ],
  [["  "], ["hooks", "at"], [": {"]],
  [["    "], ["onAction", "at"], ["({ type, status, durationMs }) {"]],
  [
    ["      metrics"],
    ["."],
    ["timing", "at"],
    ["("],
    ['"files."', "str"],
    [" + type, durationMs);"],
  ],
  [["    },"]],
  [["    "], ["onRetry", "at"], ["({ type, attempt }) {"]],
  [
    ["      log"],
    ["."],
    ["warn", "at"],
    ["("],
    ['"retry "', "str"],
    [" + attempt + "],
    ['": "', "str"],
    [" + type);"],
  ],
  [["    },"]],
  [["    "], ["onError", "at"], ["({ error }) {"]],
  [
    ["      "],
    ["if ", "kw"],
    ["(!error.aborted) Sentry"],
    ["."],
    ["captureException", "at"],
    ["(error);"],
  ],
  [["    },"]],
  [["  },"]],
  [["});"]],
];

export const HOOKS_SCENE_DURATION = codeSceneDuration(LINES);

export const HooksScene: React.FC = () => (
  <CodeScene
    lines={LINES}
    title="Lifecycle hooks."
    filename="files.ts"
    duration={HOOKS_SCENE_DURATION}
  />
);
