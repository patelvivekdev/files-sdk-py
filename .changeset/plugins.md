---
"files-sdk": minor
---

Add an opt-in plugin system to `Files`. Plugins wrap every operation in an ordered onion — they can transform, veto, or observe (the interceptable superset of `hooks`) — and can contribute new namespaced surface.

```ts
const files = createFiles({
  adapter: s3({ bucket: "uploads" }),
  plugins: [
    {
      name: "uppercase",
      wrap: handlers({
        upload: (op, next) =>
          next({ ...op, body: (op.body as string).toUpperCase() }),
      }),
    },
  ],
});
```

Each plugin offers two optional capabilities: `wrap` (intercept any operation via the `next` onion) and `extend` (add methods like `files.usage()`). Ships with the `handlers()` helper for authoring per-verb `wrap`s with automatic passthrough, and the `createFiles()` factory that surfaces `extend` methods on the instance type. Plugins run inside the `onAction`/`onError` hooks but outside retry and key prefixing, and intercept both single and bulk operations.
