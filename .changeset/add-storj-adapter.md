---
"files-sdk": minor
---

Add Storj adapter (`files-sdk/storj`). Thin wrapper over the S3 adapter with Storj defaults: `endpoint` defaults to `https://gateway.storjshare.io` (Gateway MT, the hosted multi-tenant gateway) and is overridable for self-hosted Gateway ST, path-style addressing on, region defaulted to `us-east-1` (the gateway ignores it for routing), `"Storj error"` provider label, and `STORJ_ACCESS_KEY_ID` / `STORJ_SECRET_ACCESS_KEY` env-var fallbacks. `publicBaseUrl` accepts a linksharing prefix like `https://link.storjshare.io/raw/<accessGrant>/<bucket>` for unsigned URLs.
