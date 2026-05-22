---
"files-sdk": minor
---

`upload`, `download`, `head`, and `exists` now accept an array for bulk operations, mirroring `delete`. Pass the usual single argument for the original behavior (resolves to one result, throws on failure); pass an array to operate on many in one call and get back a structured result instead of throwing on partial failure — so you can see exactly which keys succeeded and which failed:

```ts
const up = await files.upload(
  [
    { key: "avatars/a.png", body: a, contentType: "image/png" },
    { key: "avatars/b.png", body: b },
  ],
  { concurrency: 8, stopOnError: false }
);
up.uploaded; // UploadResult[] — successes, in the order supplied
up.errors; // undefined when every item succeeded

const down = await files.download(["a.png", "b.png"]); // { downloaded, errors? }
const meta = await files.head(["a.png", "b.png"]); // { files, errors? }
const there = await files.exists(["a.png", "b.png"]); // { existing, missing, errors? }
```

`upload`'s array items are flat — each carries its own `key`, `body`, and optional `contentType` / `cacheControl` / `metadata`. No provider exposes a native batch primitive for these operations, so the SDK always fans out to per-key calls with bounded `concurrency` (default 8); `stopOnError: false` (default) attempts every item and collects per-key failures in `errors`, while `stopOnError: true` stops at the first failure. All array forms honor the client's `prefix` and report the keys the caller passed, not the internal prefixed paths. Invalid keys are reported in `errors` rather than thrown. `exists` splits results into `existing` / `missing` and only routes hard errors (auth, transport) to `errors`. The `files` CLI's `head` and `exists` commands and the MCP `head` / `exists` tools accept multiple keys too.
