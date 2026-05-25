---
"files-sdk": patch
---

Fix `signedUploadUrl({ maxSize })` failing with `501 Not Implemented` on Cloudflare R2.

The R2 adapter inherited the S3 adapter's behaviour of routing `maxSize` through a presigned `POST` policy (`content-length-range`). Cloudflare R2 does not implement the S3 `POST Object` API, so those uploads failed at upload time with `501 Not Implemented`.

R2 now throws a clear `Provider` error when `maxSize` is passed (matching how the Azure and Supabase adapters handle the same limitation), instead of handing back a POST form R2 can't serve. Omit `maxSize` to get a presigned `PUT` URL, and enforce upload caps at your application gateway. Fixes #49.
