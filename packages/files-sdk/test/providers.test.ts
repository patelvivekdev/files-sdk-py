import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CLI_EXCLUDED_PROVIDERS,
  PROVIDER_NAMES as CLI_PROVIDER_NAMES,
} from "../src/cli/registry.js";
import {
  getProvider,
  listEnvVars,
  PROVIDER_NAMES,
  PROVIDERS,
} from "../src/providers/index.js";
import type { EnvVar } from "../src/providers/index.js";

const ROOT = join(import.meta.dir, "..");

// Compare as plain strings: PROVIDER_NAMES is typed as the literal slug union,
// which doesn't line up with the `string[]` derived from package.json/Object.keys.
const CATALOG_SLUGS: string[] = [...PROVIDER_NAMES];

// Subpath exports that are not storage providers, so they have no catalog
// entry: the root barrel, the AI integrations, and the catalog module itself.
const NON_PROVIDER_EXPORTS = new Set([
  ".",
  "./ai-sdk",
  "./claude",
  "./openai",
  "./providers",
]);

const packageJson = JSON.parse(
  readFileSync(join(ROOT, "package.json"), "utf-8")
) as { exports: Record<string, unknown> };

const allEnvNames = (vars: EnvVar[]): Set<string> => {
  const names = new Set<string>();
  for (const envVar of vars) {
    names.add(envVar.key);
    for (const alias of envVar.aliases ?? []) {
      names.add(alias);
    }
  }
  return names;
};

describe("providers catalog", () => {
  test("each entry's slug matches its key", () => {
    for (const [key, provider] of Object.entries(PROVIDERS)) {
      expect(provider.slug).toBe(key);
    }
  });

  test("PROVIDER_NAMES is the sorted, complete set of slugs", () => {
    expect(CATALOG_SLUGS).toEqual(Object.keys(PROVIDERS).toSorted());
  });

  test("catalog slugs match the storage subpath exports in package.json", () => {
    const exportSlugs = Object.keys(packageJson.exports)
      .filter((key) => !NON_PROVIDER_EXPORTS.has(key))
      .map((key) => key.replace(/^\.\//u, ""))
      .toSorted();
    expect(CATALOG_SLUGS).toEqual(exportSlugs);
  });

  test("CLI registry covers every provider except documented exclusions", () => {
    const expected = PROVIDER_NAMES.filter(
      (slug) => !CLI_EXCLUDED_PROVIDERS.has(slug)
    );
    expect([...CLI_PROVIDER_NAMES]).toEqual(expected);
    // Every exclusion must still be a real provider — no stale entries.
    for (const slug of CLI_EXCLUDED_PROVIDERS) {
      expect(getProvider(slug)).toBeDefined();
    }
  });

  // The catalog declares each provider's env vars by hand; this guard reads the
  // adapter source and asserts every `readEnv("X")` literal is represented in
  // that provider's spec (as a key or alias). It catches an adapter gaining a
  // new env var that the catalog forgets. The reverse is intentionally not
  // checked: `sdk-chain` vars (AWS/GCS credential chains, etc.) are listed for
  // completeness but never read via `readEnv`.
  describe("each adapter's readEnv keys are declared in the catalog", () => {
    for (const slug of PROVIDER_NAMES) {
      test(slug, () => {
        const source = readFileSync(
          join(ROOT, "src", slug, "index.ts"),
          "utf-8"
        );
        const readKeys = [
          ...source.matchAll(/readEnv\(\s*["']([^"']+)["']\s*\)/gu),
        ].map((match) => match[1]);
        const declared = allEnvNames(listEnvVars(slug));
        for (const key of readKeys) {
          expect(declared.has(key as string)).toBe(true);
        }
      });
    }
  });
});
