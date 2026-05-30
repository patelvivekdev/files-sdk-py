---
"files-sdk": minor
---

Add `sync()` — an incremental, optionally-pruning mirror between two providers. It skips objects already identical at the destination (compare by size + etag, size, or a custom predicate), can prune destination keys the source no longer has (mirror mode), and supports `dryRun` to preview the reconciliation plan. Surfaced at parity as the CLI `sync` command and a write-gated MCP `sync` tool.
