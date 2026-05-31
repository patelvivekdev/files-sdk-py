---
"files-sdk": minor
---

Add a `compression()` plugin at `files-sdk/compression` for transparent, at-rest compression. Bodies are gzipped (or deflate / deflate-raw) on upload with the algorithm and original size recorded in metadata, and decompressed on download (bulk calls too); incompressible data is stored verbatim so storage never grows. Uses only the Compression Streams API — no native dependencies — and works on any adapter that supports metadata.
