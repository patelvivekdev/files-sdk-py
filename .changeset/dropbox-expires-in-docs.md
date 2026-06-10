---
"files-sdk": patch
---

Correct the Dropbox adapter's `expiresIn` documentation. `filesGetTemporaryLink` takes no expiry parameter — every temporary link lives ~4 hours regardless of what's requested — but the docs claimed `expiresIn` was "honored up to the 4h cap". It is validated only (values above 14400s throw); a shorter `expiresIn` is accepted but the link outlives it, so it must not be relied on as a security control with this adapter.
