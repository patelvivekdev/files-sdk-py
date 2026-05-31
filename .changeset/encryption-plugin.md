---
"files-sdk": minor
---

Add an `encryption()` plugin at `files-sdk/encryption` for provider-agnostic, at-rest envelope encryption. A per-object data key encrypts the body with AES-256-GCM and your master key wraps it into the object's metadata; downloads decrypt transparently (bulk calls too). Uses only the Web Crypto API — no native dependencies — and works on any adapter that supports metadata. Also exports `generateEncryptionKey()`.
