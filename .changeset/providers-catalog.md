---
"files-sdk": minor
---

Add a `files-sdk/providers` export: a zero-dependency catalog of every storage provider and the environment variables each one reads. `PROVIDERS` maps each slug to its display name, description, optional peer dependencies, and a structured env spec — `required` vars, mutually exclusive `credentialModes` (so Azure's connection-string-or-key-or-SAS choice is expressible), `optional` tuning vars, and non-env `config`. Every variable is tagged `secret` and `readBy` (`"files-sdk"` vs the underlying SDK's `"sdk-chain"`, so AWS/GCS credential-chain vars aren't mislabeled as required). Helpers: `getProvider`, `listEnvVars`, `getSecretEnvVars`. `PROVIDER_NAMES` and the `Provider`/`ProviderSlug` types are also re-exported from the package root. Useful for sync engines, config UIs, and onboarding flows that need to enumerate providers and their required configuration up front.
