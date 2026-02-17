import { z, ZodError } from 'zod';

const optionalEnvValue = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  },
  z.string().trim().min(1).optional()
);
const requiredEnvValue = z.string().trim().min(1);

/**
 * Base schema for the `config/env/lab.env` file consumed by the CLI.
 */
export const labEnvSchema = z
  .object({
    GITEA_UID: optionalEnvValue,
    GITEA_GID: optionalEnvValue,
    GITEA_ROOT_USERNAME: optionalEnvValue,
    GITEA_ROOT_PASSWORD: optionalEnvValue,
    GITEA_ROOT_EMAIL: optionalEnvValue,
    N8N_ROOT_FIRST_NAME: optionalEnvValue,
    N8N_ROOT_LAST_NAME: optionalEnvValue,
    N8N_ROOT_EMAIL: optionalEnvValue,
    N8N_ROOT_PASSWORD: optionalEnvValue,
    OPENWEBUI_ROOT_EMAIL: optionalEnvValue,
    OPENWEBUI_ROOT_PASSWORD: optionalEnvValue,
    OLLAMA_EMBEDDING_MODEL: optionalEnvValue,
    OLLAMA_CHAT_MODEL: optionalEnvValue,
    POSTGRES_DEV_HOST_PORT: optionalEnvValue,
    LAB_URL: optionalEnvValue,
    GITEA_URL: optionalEnvValue,
    N8N_URL: optionalEnvValue,
    OPENWEBUI_URL: optionalEnvValue,
    OLLAMA_URL: optionalEnvValue,
    OLLAMA_GATEWAY_USER: optionalEnvValue,
    OLLAMA_GATEWAY_PASSWORD: optionalEnvValue
  })
  .catchall(optionalEnvValue);

/**
 * Schema for workflows that require bootstrap-related env values.
 */
export const bootstrapEnvSchema = labEnvSchema.extend({
  GITEA_UID: requiredEnvValue,
  GITEA_GID: requiredEnvValue,
  GITEA_ROOT_USERNAME: requiredEnvValue,
  GITEA_ROOT_PASSWORD: requiredEnvValue,
  GITEA_ROOT_EMAIL: requiredEnvValue,
  N8N_URL: requiredEnvValue,
  N8N_ROOT_FIRST_NAME: requiredEnvValue,
  N8N_ROOT_LAST_NAME: requiredEnvValue,
  N8N_ROOT_EMAIL: requiredEnvValue,
  N8N_ROOT_PASSWORD: requiredEnvValue
});

/**
 * Schema for smoke checks against the local lab endpoints.
 */
export const smokeEnvSchema = labEnvSchema.extend({
  LAB_URL: requiredEnvValue,
  GITEA_URL: requiredEnvValue,
  N8N_URL: requiredEnvValue,
  N8N_ROOT_EMAIL: requiredEnvValue,
  N8N_ROOT_PASSWORD: requiredEnvValue
});

/**
 * Schema for AI bootstrap workflows that reconcile the Ollama runtime.
 */
export const aiBootstrapEnvSchema = labEnvSchema.extend({
  OLLAMA_EMBEDDING_MODEL: requiredEnvValue,
  OLLAMA_CHAT_MODEL: requiredEnvValue
});

/**
 * Schema for AI smoke checks against Open WebUI and Ollama.
 */
export const aiSmokeEnvSchema = labEnvSchema.extend({
  OPENWEBUI_URL: requiredEnvValue,
  OPENWEBUI_ROOT_EMAIL: requiredEnvValue,
  OPENWEBUI_ROOT_PASSWORD: requiredEnvValue,
  OLLAMA_URL: requiredEnvValue,
  OLLAMA_GATEWAY_USER: requiredEnvValue,
  OLLAMA_GATEWAY_PASSWORD: requiredEnvValue,
  OLLAMA_EMBEDDING_MODEL: requiredEnvValue,
  OLLAMA_CHAT_MODEL: requiredEnvValue
});

/**
 * Formats a Zod validation error into a short CLI-friendly string.
 */
export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'value';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}
