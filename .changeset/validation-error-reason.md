---
"files-sdk": minor
---

The `validation()` plugin now throws a dedicated `ValidationError` (exported from `files-sdk/validation` along with the `ValidationReason` type) with a `reason` discriminant — `"size"`, `"type"`, or `"key"` — so callers can branch on which rule failed without parsing the message. It's backward compatible: `ValidationError extends FilesError`, keeps `code: "Provider"`, and the messages are unchanged, so existing catches keep working. `maxSize`/`minSize` share `reason: "size"` (the message says which bound), and the `signedUploadUrl()` fail-closed throw stays a plain `FilesError` — it's the plugin refusing an unenforceable operation, not the file failing a rule.
