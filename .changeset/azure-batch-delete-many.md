---
"files-sdk": patch
---

Azure gains a native `deleteMany` backed by the Blob Batch API (256 keys per batch, idempotent on already-missing blobs); `stopOnError` falls back to sequential deletes. Previously it fanned out to single deletes.
