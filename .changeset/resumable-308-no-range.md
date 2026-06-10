---
"files-sdk": patch
---

Fix the offset-HTTP resumable driver (GCS/Firebase/Google Drive) optimistically advancing past a chunk on a `308` response with no `Range` header. In this protocol that response means the server persisted nothing (the probe path already maps it to offset 0), so assuming the whole chunk landed silently skipped its bytes and made the upload fail later at a confusing offset. The chunk now throws a retryable error instead, so the per-chunk retry re-sends it and a token resume re-probes the true offset.
