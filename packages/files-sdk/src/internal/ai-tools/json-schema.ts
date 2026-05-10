import { toJSONSchema } from "zod";
import type { ZodType } from "zod";

/**
 * Convert a Zod schema to a JSON Schema object suitable for OpenAI's
 * function-tool `parameters` field. Strips `$schema` (the OpenAI API ignores
 * dialect declarations and including it just bloats every tool definition).
 *
 * Requires Zod 4 — Zod 3 does not expose `toJSONSchema`. The `files-sdk/openai`
 * subpath inherits this requirement.
 */
export const toOpenAIJsonSchema = (
  schema: ZodType
): Record<string, unknown> => {
  const json = toJSONSchema(schema) as Record<string, unknown>;
  const { $schema: _ignored, ...rest } = json;
  return rest;
};
