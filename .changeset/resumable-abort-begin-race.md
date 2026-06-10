---
"files-sdk": patch
---

Fix `control.abort()` racing session creation in resumable uploads. Aborting while `driver.begin()` (or a resume `probe()`) was in flight found no discard hook installed yet, so the just-created provider-side session (e.g. an S3 multipart upload, billed until aborted) was never discarded — and the session assignment then re-populated a live token onto the aborted control, violating `abort()`'s terminal contract. The orchestrator now notices the abort right after session setup, discards the provider session, and keeps the control terminal.
