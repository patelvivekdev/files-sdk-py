---
"files-sdk": minor
---

Add an in-memory adapter at `files-sdk/memory`. It implements the full `Adapter` contract backed by a `Map`, so you can test code that uses `Files` without touching disk or real storage — the same swap-in-via-env story as the other adapters, but with nothing to clean up.

```ts
import { Files } from "files-sdk";
import { memory } from "files-sdk/memory";

const files = new Files({ adapter: memory() });
await files.upload("hello.txt", "hi");
(await files.download("hello.txt")).text(); // "hi"
```

Zero dependencies and isomorphic (no `node:fs`/`node:crypto`), so it runs unchanged in Node, Bun, Deno, the browser, and edge runtimes. Pass `initial` to pre-populate fixtures, and reach into `adapter.raw` (the backing `Map`) to inspect or reset the store between tests:

```ts
const adapter = memory({ initial: { "users/1.json": '{"id":1}' } });
adapter.raw.clear();
```

`url()` returns an opaque, non-fetchable `memory://${key}` and `signedUploadUrl()` a `memory://` placeholder — there's no server backing the store. It's a test/reference adapter, not for production.
