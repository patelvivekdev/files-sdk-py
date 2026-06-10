---
"files-sdk": patch
---

Fix the array forms of `download`/`head`/`exists`/`delete` ignoring the constructor-level `signal` and `timeout` defaults. The bulk bases call the adapter directly to stay retry-free (as documented), but that also skipped the instance-wide abort signal and timeout — aborting the constructor signal mid-bulk cancelled nothing, and a configured `timeout` never bounded bulk reads or deletes (bulk upload already honored both). Bulk per-item calls now run under the same signal/timeout plumbing as single operations, still without retries.
