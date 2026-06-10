---
"files-sdk": patch
---

Fix the CLI silently swallowing non-EPIPE stdout errors. The EPIPE-as-success handler (for `files … | head`-style pipelines), by being registered, also suppressed Node's default throw for every other stdout error — an EIO/EBADF or a full disk behind a redirect let the command exit 0 having written nothing. Non-EPIPE stdout errors now report to stderr and exit 2.
