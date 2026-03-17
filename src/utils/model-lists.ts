import type { LabEnv } from '../types/project.types.js';

type OllamaModelEnv = Pick<
  LabEnv,
  'OLLAMA_CHAT_MODEL' | 'OLLAMA_EMBEDDING_MODEL' | 'OLLAMA_RUNTIME_MODELS'
>;

/**
 * Collects the distinct Ollama model references configured for local bootstrap and smoke checks.
 */
export function collectConfiguredOllamaModels(env: OllamaModelEnv): string[] {
  return [...new Set([
    ...splitConfiguredModels(env.OLLAMA_RUNTIME_MODELS),
    ...(env.OLLAMA_CHAT_MODEL ? [env.OLLAMA_CHAT_MODEL.trim()] : []),
    ...(env.OLLAMA_EMBEDDING_MODEL ? [env.OLLAMA_EMBEDDING_MODEL.trim()] : [])
  ].filter((value) => value.length > 0))];
}

/**
 * Normalizes Ollama model identifiers so smoke checks match the tags reported by `/api/tags`.
 */
export function collectExpectedOllamaModelIdentifiers(env: OllamaModelEnv): string[] {
  return collectConfiguredOllamaModels(env).map((modelName) =>
    modelName.includes(':') ? modelName : `${modelName}:latest`
  );
}

function splitConfiguredModels(rawValue?: string): string[] {
  return (rawValue ?? '')
    .split(/[,\n]/u)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
