---
"files-sdk": patch
---

In-memory adapter (`files-sdk/memory`): give `metadata` the same value semantics the bytes already have. The adapter cloned an entry's bytes on the way in but stored and returned the `metadata` object by reference, so three aliases leaked: mutating the object passed to `upload()` (or an `initial` seed) after the call reached into the store, mutating a `head()`/`download()` result's `metadata` reached back into the store, and `copy()` left the source and destination sharing one mutable metadata object — mutating one silently changed the other. Metadata is now shallow-cloned on write and on read, so each stored entry owns its own copy and every read hands back a fresh one, matching how a real backend round-trips metadata. Bytes behavior is unchanged.
