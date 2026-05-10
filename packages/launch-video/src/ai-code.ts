import type { Line } from "./code";

export type AiSdkId = "vercel" | "openai" | "claude";

export const AI_SDKS: Record<
  AiSdkId,
  { label: string; filename: string; color: string }
> = {
  claude: {
    color: "#D97706",
    filename: "agents/claude.ts",
    label: "Claude Agent SDK",
  },
  openai: {
    color: "#10A37F",
    filename: "agents/openai.ts",
    label: "OpenAI Agents",
  },
  vercel: {
    color: "#1F2937",
    filename: "agents/ai-sdk.ts",
    label: "Vercel AI SDK",
  },
};

export const AI_SDK_ORDER: AiSdkId[] = ["vercel", "openai", "claude"];

// Indices (0-based) of lines that highlight when the SDK swaps.
// These positions are consistent across all three SDKs.
export const AI_HIGHLIGHT_LINES = [2, 6] as const;

const SHARED_HEADER: Line[] = [
  [
    ["import", "kw"],
    [" { Files } "],
    ["from", "kw"],
    [" "],
    ["'files-sdk'", "str"],
  ],
  [
    ["import", "kw"],
    [" { s3 } "],
    ["from", "kw"],
    [" "],
    ["'files-sdk/s3'", "str"],
  ],
];

const SHARED_FILES_LINE: Line = [
  ["const", "kw"],
  [" files = "],
  ["new", "kw"],
  [" Files({ adapter: s3({ bucket: "],
  ["'uploads'", "str"],
  [" }) })"],
];

const VERCEL: Line[] = [
  ...SHARED_HEADER,
  [
    ["import", "kw"],
    [" { createFileTools } "],
    ["from", "kw"],
    [" "],
    ["'files-sdk/ai-sdk'", "str"],
  ],
  [
    ["import", "kw"],
    [" { generateText } "],
    ["from", "kw"],
    [" "],
    ["'ai'", "str"],
  ],
  [],
  SHARED_FILES_LINE,
  [["const", "kw"], [" tools = createFileTools({ files })"]],
  [],
  [["const", "kw"], [" result = "], ["await", "kw"], [" generateText({"]],
  [["  model: yourModel,"]],
  [["  tools,"]],
  [
    ["  prompt: "],
    ["'Find every CSV under reports/ and summarize the latest one.'", "str"],
    [","],
  ],
  [["})"]],
];

const OPENAI: Line[] = [
  ...SHARED_HEADER,
  [
    ["import", "kw"],
    [" { createAgentsFileTools } "],
    ["from", "kw"],
    [" "],
    ["'files-sdk/openai'", "str"],
  ],
  [
    ["import", "kw"],
    [" { Agent, run } "],
    ["from", "kw"],
    [" "],
    ["'@openai/agents'", "str"],
  ],
  [],
  SHARED_FILES_LINE,
  [["const", "kw"], [" tools = createAgentsFileTools({ files })"]],
  [],
  [["const", "kw"], [" agent = "], ["new", "kw"], [" Agent({"]],
  [["  instructions: "], ["'Help the user manage their files.'", "str"], [","]],
  [["  name: "], ["'Files agent'", "str"], [","]],
  [["  tools: Object.values(tools),"]],
  [["})"]],
  [],
  [
    ["const", "kw"],
    [" result = "],
    ["await", "kw"],
    [" run(agent, "],
    ["'List my files.'", "str"],
    [")"],
  ],
];

const CLAUDE: Line[] = [
  ...SHARED_HEADER,
  [
    ["import", "kw"],
    [" { createClaudeFileTools } "],
    ["from", "kw"],
    [" "],
    ["'files-sdk/claude'", "str"],
  ],
  [
    ["import", "kw"],
    [" { query } "],
    ["from", "kw"],
    [" "],
    ["'@anthropic-ai/claude-agent-sdk'", "str"],
  ],
  [],
  SHARED_FILES_LINE,
  [["const", "kw"], [" tools = createClaudeFileTools({ files })"]],
  [],
  [
    ["for", "kw"],
    [" "],
    ["await", "kw"],
    [" ("],
    ["const", "kw"],
    [" message "],
    ["of", "kw"],
    [" query({"],
  ],
  [
    ["  prompt: "],
    ["'Find every CSV under reports/ and summarize the latest one.'", "str"],
    [","],
  ],
  [["  options: {"]],
  [["    mcpServers: tools.mcpServers,"]],
  [["    allowedTools: tools.allowedTools,"]],
  [["    canUseTool: tools.canUseTool,"]],
  [["  },"]],
  [["})) {"]],
  [["  "], ["// handle messages", "cm"]],
  [["}"]],
];

export const buildAiLines = (sdk: AiSdkId): Line[] => {
  switch (sdk) {
    case "claude": {
      return CLAUDE;
    }
    case "openai": {
      return OPENAI;
    }
    case "vercel": {
      return VERCEL;
    }
    default: {
      return CLAUDE;
    }
  }
};
