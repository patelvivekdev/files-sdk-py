---
"files-sdk": patch
---

R2 (HTTP) now advertises `supportsRange`, so ranged downloads work in HTTP mode — it delegates to `s3()`, which honors the `Range` request. The R2 Workers binding already supported them.
