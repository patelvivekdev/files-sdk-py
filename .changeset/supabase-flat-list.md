---
"files-sdk": patch
---

Fix the Supabase adapter's flat `list()` missing nested objects. The no-delimiter path used the legacy V1 `list()` API, which is folder-scoped and non-recursive — a bucket with nested keys (`docs/a.txt`) listed phantom zero-byte rows for the folders and never returned the nested objects, so `listAll`, `search()`, `sync`/`transfer`, and every list-based plugin silently missed them; a partial prefix (`prefix: "do"`) returned nothing at all. The flat path now uses the V2 list API: a recursive string-prefix scan over full keys with a real server cursor. Note that flat-list cursors are now opaque V2 cursors rather than numeric offsets — don't persist cursors across versions.
