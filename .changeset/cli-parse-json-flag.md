---
"files-sdk": patch
---

Fix the CLI blaming `--config-json` for malformed JSON passed to `transfer --to` / `sync --to`. The shared JSON parser hardcoded the flag name in its error message; it now names the flag the user actually passed.
