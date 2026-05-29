---
"files-sdk": minor
---

Add directory-style listing to `list`: a new `delimiter` option collapses keys into S3-style common prefixes ("folders"), returned in `ListResult.prefixes`. Supported on every adapter with a folder or prefix model — the object stores (S3 family, R2, GCS, Firebase Storage, Azure) and `fs`/memory/FTP/SFTP/Google Drive/Cloudinary accept any delimiter; the folder-based providers (Vercel Blob, Netlify Blobs, Supabase, Dropbox, Box, OneDrive, SharePoint) accept `"/"`. Adapters with no folder concept (UploadThing, Appwrite, PocketBase, Convex, Bun's S3) advertise `supportsDelimiter: false` and throw rather than silently returning a flat list.
