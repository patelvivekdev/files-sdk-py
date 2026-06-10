---
"files-sdk": patch
---

Fix `tiering()`'s `tierOf()`/`tier()` ignoring the instance `prefix`. The extend methods built their hot-tier runner from the bare adapter, while every other operation goes through the plugin chain and gets the prefix applied — so with `prefix` set, `files.exists(key)` was `true` but `files.tierOf(key)` returned `undefined`, and `files.tier(key, …)` threw `NotFound` (or touched a same-named unprefixed object). The extend runner now re-applies the prefix. `Files` also gains a public `prefix` getter so plugins can do the same.
