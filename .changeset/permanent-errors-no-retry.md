---
"files-sdk": patch
---

Stop retrying deterministic failures. The "server ignored the requested byte range" and "only supports the / delimiter" guards throw `Provider`-coded errors from inside the retryable adapter call, and `Provider` was the one code the retry loop treats as transient — so a ranged `download()` with retries against a host that ignores `Range` re-issued (and re-transferred) the full GET on every attempt with backoff in between before surfacing the error. `FilesError` now carries a `permanent` flag that opts a deterministic failure out of retries, set by both guards.
