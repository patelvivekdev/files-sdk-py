---
"files-sdk": patch
---

Fix the Supabase adapter passing `responseContentDisposition` straight through as Supabase's `download` filename. Supabase's `download: string` option means "attachment **named** this", so `responseContentDisposition: "attachment"` served a file literally named `attachment`, and a full `attachment; filename="report.pdf"` value produced a garbled filename embedding the whole header. Bare `attachment` now maps to `download: true`, a `filename=` parameter maps to that name, and dispositions Supabase can't express (e.g. `inline`) throw instead of being mislabeled.
