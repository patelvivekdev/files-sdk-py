---
"files-sdk": patch
---

Harden `encryption()` against envelope-metadata tampering and document its threat model precisely. GCM already authenticates the ciphertext and the wrapped DEK, but `fsenc_size` — the declared plaintext size that `head()`/`list()` report — is plain metadata an attacker with raw provider write access could forge; `download()` now verifies it against the decrypted length and throws on a mismatch. The JSDoc now also states explicitly that the envelope is not bound to its object key (an attacker with raw provider write access can splice a whole envelope onto another key): binding to keys would break the documented server-side `copy`/`move` and key-aliasing plugin compositions, so tenants needing that isolation should use separate KEKs.
