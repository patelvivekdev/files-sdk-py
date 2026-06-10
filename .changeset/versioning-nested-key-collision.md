---
"files-sdk": patch
---

Fix a nested-key collision in the `versioning()` plugin's version store. `a`'s version directory (`.versions/a/`) is a prefix of `a/b`'s (`.versions/a/b/`), so `versions("a")` reported `a/b`'s snapshots as versions of `a`, `restore("a")` could silently overwrite `a` with `a/b`'s old bytes, and pruning `a` could delete `a`'s only snapshot while counting `a/b`'s against the limit. Version ids never contain `/`, so listings now ignore anything deeper than the key's own directory, and `restore()` rejects a `versionId` containing `/`. The on-disk layout is unchanged — existing version stores keep working.
