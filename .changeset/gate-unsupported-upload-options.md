---
"files-sdk": patch
---

Gate unsupported `metadata` / `cacheControl` centrally in the `Files` wrapper via new `Adapter.supportsMetadata` / `Adapter.supportsCacheControl` flags — exactly like `supportsRange`. Every adapter is flagged accurately and the per-adapter inline throws (Convex, FTP, SFTP, Dropbox, Box, OneDrive, Cloudinary, Appwrite, PocketBase, Bunny Storage, Bun's S3) are removed in favor of the one gate. **Behavior change:** Vercel Blob (`metadata`), UploadThing (`metadata`/`cacheControl`), and SharePoint (`metadata`/`cacheControl`) previously dropped these options silently and now throw a `FilesError`, matching every other adapter.
