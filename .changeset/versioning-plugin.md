---
"files-sdk": minor
---

Add a `versioning()` plugin at `files-sdk/versioning` that snapshots an object's prior bytes before any overwrite or delete and adds `files.versions(key)` / `files.restore(key, versionId?)` to roll a key back. Snapshots are server-side copies under a configurable prefix (`.versions/` by default), so it's body-transparent — streaming, range downloads, `url()`, and `signedUploadUrl()` keep working, and it composes with `compression()` / `encryption()` by snapshotting whatever they stored. Optional `limit` caps the versions kept per key; version objects are hidden from `list()`. It's the first plugin to use `extend`, so use `createFiles` to surface the new methods on the type. No native dependencies; works on any adapter.
