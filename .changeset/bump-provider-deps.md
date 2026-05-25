---
"files-sdk": patch
---

Update bundled and peer dependencies.

The CLI's `commander` runtime dependency moves to v14. Several optional provider-SDK peer floors are raised to the majors now built and tested against:

- `@anthropic-ai/claude-agent-sdk` → `^0.3.0` (claude adapter)
- `@googleapis/drive` → `^20.0.0` (google-drive adapter)
- `google-auth-library` → `^10.0.0` (gcs / google-drive auth)
- `node-appwrite` → `^25.0.0` (appwrite adapter)
- `pocketbase` → `^0.27.0` (pocketbase adapter)

No public API or behaviour changes. If you use one of the adapters above, upgrade its peer to the new major.
