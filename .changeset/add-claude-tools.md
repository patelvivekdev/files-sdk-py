---
"files-sdk": minor
---

Add Claude Agent SDK tools subpath (`files-sdk/claude`) exporting `createClaudeFileTools(...)` — wraps a configured `Files` instance as an in-process MCP server ready to drop into `query()` from [`@anthropic-ai/claude-agent-sdk`](https://docs.claude.com/en/api/agent-sdk/overview) (the renamed Claude Code SDK).

The Claude Agent SDK consumes tools differently than the OpenAI/Vercel adapters: tools are bundled into an `SdkMcpServer` and surfaced to the agent via `mcpServers` + `allowedTools`, with approval enforced through a top-level `canUseTool` callback. The factory returns all four pieces:

```ts
const tools = createClaudeFileTools({ files });

for await (const msg of query({
  prompt: "List my files.",
  options: {
    mcpServers: tools.mcpServers,
    allowedTools: tools.allowedTools,
    canUseTool: tools.canUseTool,
  },
})) {
  /* ... */
}
```

Same eight file operations as the other AI subpaths (`listFiles`, `getFileMetadata`, `downloadFile`, `getFileUrl`, `uploadFile`, `deleteFile`, `copyFile`, `signUploadUrl`) with the same approval-gating defaults, `readOnly` mode, and per-tool `overrides` (description + MCP `annotations`). The bundled `canUseTool` denies approval-gated writes; compose your own using `tools.needsApproval(name)` for human-in-the-loop UX — it accepts both bare names (`"uploadFile"`) and the MCP-prefixed form (`"mcp__files__uploadFile"`) the SDK passes in. The MCP server name defaults to `"files"` and is configurable via `serverName`, which also flows through to the `mcp__<server>__*` strings in `allowedTools`. Read tools get a `readOnlyHint` annotation; writes get `destructiveHint` (`copyFile` / `signUploadUrl` use `idempotentHint` instead).

Individual tool factories (`claudeUploadFile`, `claudeDownloadFile`, …) are also exported as `SdkMcpToolDefinition` instances for callers that want to compose their own `createSdkMcpServer` rather than use the bundled one. `@anthropic-ai/claude-agent-sdk` and `zod` are optional peer dependencies — only required when consuming the new subpath.
