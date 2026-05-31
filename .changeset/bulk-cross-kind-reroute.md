---
"files-sdk": patch
---

Fix plugin cross-kind re-routing inside bulk operations. A plugin whose `wrap` calls `next()` with a different verb than the one it's intercepting — e.g. `dedup()`'s `exists` probe, or `versioning()`'s snapshot `head` + `copy` — misrouted when it ran inside `upload([...])` / `download([...])` / `head([...])` / `exists([...])` / `delete([...])`, because each bulk item was dispatched with a base locked to that one verb. The bulk bases now delegate any re-routed, cross-kind sub-op to the single-operation path, so it behaves identically in a bulk call as in a single one; the item's own verb keeps its retry-free, hook-quiet semantics.
