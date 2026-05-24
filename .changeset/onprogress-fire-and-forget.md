---
"files-sdk": patch
---

`onProgress` is now truly fire-and-forget: a throwing progress reporter can no longer fail or retry the upload it observes. Previously, a buffered upload's final progress report ran inside the retryable attempt, so a throw was caught by the retry layer, mislabelled a provider error, and re-uploaded the body up to `retries` times before rejecting; on the streaming path a throw errored the underlying stream and failed the upload. All three wrapper-driven `onProgress` calls now route through the same swallow-and-ignore guard the `hooks` callbacks use, matching the contract already documented on `FilesHooks` ("a hook that throws can never fail the operation it observes"). Self-reporting adapters (`reportsUploadProgress`) are unaffected — they own their own reporting.
