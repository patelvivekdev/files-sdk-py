---
"files-sdk": minor
---

Add Hetzner Object Storage adapter (`files-sdk/hetzner`). Thin wrapper over the S3 adapter with Hetzner defaults: endpoint derived from the `region` location code (`fsn1`, `nbg1`, `hel1`) as `https://<region>.your-objectstorage.com` and overridable, virtual-hosted-style addressing, `"Hetzner error"` provider label, and `HCLOUD_ACCESS_KEY_ID` / `HCLOUD_SECRET_ACCESS_KEY` env-var fallbacks. `publicBaseUrl` accepts a custom CNAME or proxy host for unsigned URLs; otherwise `url()` returns a presigned GetObject (1-hour default).
