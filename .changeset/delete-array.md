---
"files-sdk": minor
---

`delete()` now accepts an array of keys for bulk deletion. Pass a string to remove one object (resolves to `void`, throws on failure as before); pass an array to remove many in one call and get back a structured `{ deleted, errors? }` result instead of throwing on partial failure — so you can see exactly which keys failed:

```ts
const result = await files.delete(
  ["avatars/a.png", "avatars/b.png", "avatars/c.png"],
  { concurrency: 8, stopOnError: false }
);

result.deleted; // string[] — keys removed, in the order supplied
result.errors; // undefined when every key succeeded
```

Adapters with a native bulk primitive use it — S3 sends `DeleteObjects` (chunked into batches of 1000, the provider limit), Supabase uses `remove(keys)`, and UploadThing uses `deleteFiles(keys)` — while every other adapter fans out to single deletes with bounded `concurrency` (default 8). `stopOnError: false` (default) attempts every key and collects per-key failures in `errors`; `stopOnError: true` stops at the first failure. Invalid keys are reported in `errors` rather than thrown, and the array form honors the client's `prefix` and is no-op friendly on providers that treat a missing key as success. The `files` CLI's `delete` command and the MCP `delete` tool accept multiple keys too.
