---
"files-sdk": patch
---

Harden the fs adapter's resumable-upload `adopt()` against doctored resume tokens. The persisted token's `tempPath` was adopted verbatim, so a tampered token (e.g. one stored in Redis/a DB and rehydrated via `UploadControl.from`) could point the partial-file writes, the completing rename, and the discard delete at an arbitrary filesystem path outside the adapter root. The temp path is fully derived from the traversal-checked key, so it is now recomputed and a token whose `tempPath` doesn't match is rejected — which also catches tokens minted against a different adapter root.
