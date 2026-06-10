---
"files-sdk": patch
---

Fix `cache()` serving presigned URLs past their signature when `url()` is called without `expiresIn`. The signature-lifetime cap only applied when the caller passed `expiresIn`, but the adapter signs default calls with a finite lifetime too — so with a long `ttl` (or `ttl: 0`, which disables time-based expiry entirely) the cache kept handing out dead links indefinitely. Entries for default-signed URLs are now capped at the assumed signature lifetime, configurable via the new `defaultUrlExpiresIn` cache option (defaults to the SDK-wide 3600s; set it to match your adapter if you changed its default).
