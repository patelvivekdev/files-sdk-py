---
"files-sdk": patch
---

Fix an off-by-one in the `zip()` plugin's classic-format limits. The writer accepted exactly 65,535 entries and sizes/offsets of exactly `0xFFFFFFFF` — but those are the ZIP64 sentinel values, which the plugin's own `unzip()` (and any ZIP64-aware reader) treats as "the real value lives in a ZIP64 record", so such an archive couldn't be read back. The limit checks are now `>=`, refusing the sentinel values themselves.
