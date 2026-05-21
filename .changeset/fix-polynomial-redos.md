---
"files-sdk": patch
---

Harden three internal regexes against polynomial ReDoS. The trailing-slash/`[. ]`-stripping patterns in `normalizePrefix` (core, used by every adapter's prefix handling), the `fs` adapter's Windows trailing-noise check, and the `bunny-storage` key parser each anchor with a `(?<!…)` lookbehind so the engine can't re-attempt the match at every character of a long trailing run (e.g. `"users////…"` or `"x.meta.json....    "`). Behavior is unchanged; only the worst-case matching cost is fixed.
