import { PROVIDERS } from "files-sdk/providers";
import type { Provider } from "files-sdk/providers";

/**
 * The provider catalog is owned by the SDK package and re-exported here so the
 * site and the published package can never drift. Each entry carries the
 * display name, description, optional peer dependencies, and the env-var spec —
 * see `files-sdk/providers` for the source of truth.
 */
export type Adapter = Provider;

export const ADAPTERS: Adapter[] = Object.values(PROVIDERS);
