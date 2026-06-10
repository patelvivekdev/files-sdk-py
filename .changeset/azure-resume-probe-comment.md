---
"files-sdk": patch
---

Document why the Azure resumable-upload probe is safe to treat staged (uncommitted) blocks as skippable: blocks Azure garbage-collects before finalization make `commitBlockList` fail loudly (`InvalidBlockList`) rather than committing with gaps, and a retry re-probes correctly. Comment-only; no behavior change.
