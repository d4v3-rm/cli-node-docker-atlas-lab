import type { LegacyAiAliasOptions } from '../types/cli.types.js';

interface CanonicalAiLayerOptions {
  withAiLlm?: boolean;
}

/**
 * Commander assigns the option key from the trailing long alias, so
 * `--with-ai-llm, --with-ai` currently surfaces as `withAi`.
 * Normalize both spellings to the canonical layer keys used by services.
 */
export function normalizeAiAliasOptions<TOptions extends LegacyAiAliasOptions & CanonicalAiLayerOptions>(
  options: TOptions
): TOptions & {
  withAiLlm: boolean;
} {
  return {
    ...options,
    withAiLlm: Boolean(options.withAiLlm || options.withAi)
  };
}
