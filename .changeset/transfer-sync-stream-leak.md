---
"files-sdk": patch
---

Fix `transfer()` and `sync()` leaking the source download stream when the destination upload fails. A destination that rejects before draining the body (auth error, rejected metadata, a fail-closed plugin) left the already-opened source stream — an HTTP response or file descriptor — neither drained nor cancelled, leaking one per failed key on a large walk. The stream is now cancelled best-effort before the per-key error is recorded.
