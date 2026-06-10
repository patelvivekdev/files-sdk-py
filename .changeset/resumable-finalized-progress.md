---
"files-sdk": patch
---

Fix `onProgress` reporting `loaded: Number.MAX_SAFE_INTEGER` when a resumed offset-mode session had already finalized server-side. The probe signals "already done" with a past-the-end sentinel offset, which the orchestrator forwarded verbatim to progress reporting — any UI computing `loaded / total` showed a ~9·10¹⁵-byte upload. The orchestrator now clamps the starting offset to the body size; the upload still completes with the probed result as before.
