---
"files-sdk": minor
---

Add `move` and `listAll`.

`files.move(from, to, options?)` renames a key. It uses the adapter's native rename where one exists (the `fs` adapter renames in place atomically; Cloudinary uses its server-side `rename`, keeping the same `asset_id` with no re-upload) and otherwise falls back to `copy` + `delete` — the same two-step every object store takes, since none offer an atomic move. Moving a key onto itself is a no-op, so the fallback can't copy-then-delete a file out of existence. `move` throws on Convex, where `copy` does (immutable storage ids, no rename).

```ts
await files.move("uploads/tmp-abc.png", "avatars/user-123.png");
```

`FileHandle` gains the matching `moveTo` / `moveFrom`, and `move` fires the lifecycle hooks (`onAction` / `onError` / `onRetry`) with a new `"move"` action type.

`files.listAll(options?)` walks every page as an async iterable, following the cursor for you:

```ts
for await (const file of files.listAll({ prefix: "avatars/" })) {
  console.log(file.key, file.size);
}
```

`prefix` scopes the walk and `limit` sets the per-page size; each page is a real `list` call, so retries, timeouts, and prefix scoping all apply.

Custom adapters can implement an optional `move(from, to, opts?)` to provide a native rename; omitting it keeps the copy + delete fallback.

The CLI gains a `move <from> <to>` command and the MCP server exposes a matching `move` tool.
