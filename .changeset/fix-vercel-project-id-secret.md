---
"files-sdk": patch
---

Fix release workflow referencing a non-existent `VERCEL_PROJECT_ID_WEB` secret; now reads `VERCEL_PROJECT_ID` to match the configured repository secret so the post-publish Vercel deploy succeeds.
