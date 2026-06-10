---
"files-sdk": patch
---

Fix `contentType()` leaving the caller's source stream locked and open when a stream upload is rejected. With `onMismatch: "reject"` / `onUnknown: "reject"` (or any downstream failure before the replay body was consumed), the peek reader held its lock forever and the underlying request body / file handle was never cancelled. The replay body is now cancelled best-effort when the upload throws.
