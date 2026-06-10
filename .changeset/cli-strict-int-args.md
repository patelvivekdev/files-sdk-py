---
"files-sdk": patch
---

Fix CLI integer flags silently truncating trailing garbage. `--part-size 5MB` parsed to 5 bytes, `--timeout 1s` to 1 millisecond, and `--limit 1.9` to 1 — `parseInt` only rejected fully non-numeric input. Integer flags now require a plain integer and fail loudly otherwise.
