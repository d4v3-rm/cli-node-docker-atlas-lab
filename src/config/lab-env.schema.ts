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
 * Base schema for the `env/lab.env` file consumed by the CLI.
 */
export const labEnvSchema = z
  .object({
    GITLAB_ROOT_USERNAME: optionalEnvValue,
    GITLAB_ROOT_PASSWORD: optionalEnvValue,
    GITLAB_ROOT_EMAIL: optionalEnvValue,
    N8N_ROOT_FIRST_NAME: optionalEnvValue,
    N8N_ROOT_LAST_NAME: optionalEnvValue,
    N8N_ROOT_EMAIL: optionalEnvValue,
    N8N_ROOT_PASSWORD: optionalEnvValue,
    BOOKSTACK_ROOT_NAME: optionalEnvValue,
    BOOKSTACK_ROOT_EMAIL: optionalEnvValue,
    BOOKSTACK_ROOT_PASSWORD: optionalEnvValue,
    OPENWEBUI_ROOT_EMAIL: optionalEnvValue,
    OPENWEBUI_ROOT_PASSWORD: optionalEnvValue,
    PENPOT_ROOT_NAME: optionalEnvValue,
    PENPOT_ROOT_EMAIL: optionalEnvValue,
    PENPOT_ROOT_PASSWORD: optionalEnvValue,
    OLLAMA_EMBEDDING_MODEL: optionalEnvValue,
    OLLAMA_CHAT_MODEL: optionalEnvValue,
    OLLAMA_RUNTIME_MODELS: optionalEnvValue,
    POSTGRES_DEV_HOST_PORT: optionalEnvValue,
    LAB_URL: optionalEnvValue,
    GITLAB_URL: optionalEnvValue,
    GITLAB_EXTERNAL_URL: optionalEnvValue,
    N8N_URL: optionalEnvValue,
    BOOKSTACK_URL: optionalEnvValue,
    OPENWEBUI_URL: optionalEnvValue,
    OLLAMA_URL: optionalEnvValue,
    PENPOT_URL: optionalEnvValue,
    OLLAMA_GATEWAY_USER: optionalEnvValue,
    OLLAMA_GATEWAY_PASSWORD: optionalEnvValue
  })
  .catchall(optionalEnvValue);

/**
 * Schema for workflows that require bootstrap-related env values.
 */
export const bootstrapEnvSchema = labEnvSchema.extend({
  GITLAB_ROOT_USERNAME: requiredEnvValue,
  GITLAB_ROOT_PASSWORD: requiredEnvValue,
  GITLAB_ROOT_EMAIL: requiredEnvValue,
  BOOKSTACK_ROOT_NAME: requiredEnvValue,
  BOOKSTACK_ROOT_EMAIL: requiredEnvValue,
  BOOKSTACK_ROOT_PASSWORD: requiredEnvValue,
  PENPOT_ROOT_NAME: requiredEnvValue,
  PENPOT_ROOT_EMAIL: requiredEnvValue,
  PENPOT_ROOT_PASSWORD: requiredEnvValue
});

/**
 * Schema for smoke checks against the local lab endpoints.
 */
export const smokeEnvSchema = labEnvSchema.extend({
  LAB_URL: requiredEnvValue,
  GITLAB_URL: requiredEnvValue,
  BOOKSTACK_URL: requiredEnvValue,
  PENPOT_URL: requiredEnvValue
});

/**
 * Schema for AI LLM bootstrap workflows that reconcile the Ollama runtime.
 */
export const aiLlmBootstrapEnvSchema = labEnvSchema.extend({
  N8N_URL: requiredEnvValue,
  N8N_ROOT_FIRST_NAME: requiredEnvValue,
  N8N_ROOT_LAST_NAME: requiredEnvValue,
  N8N_ROOT_EMAIL: requiredEnvValue,
  N8N_ROOT_PASSWORD: requiredEnvValue,
  OLLAMA_EMBEDDING_MODEL: requiredEnvValue,
  OLLAMA_CHAT_MODEL: requiredEnvValue
});

/**
 * Schema for AI LLM smoke checks against Open WebUI and Ollama.
 */
export const aiLlmSmokeEnvSchema = labEnvSchema.extend({
  N8N_URL: requiredEnvValue,
  N8N_ROOT_EMAIL: requiredEnvValue,
  N8N_ROOT_PASSWORD: requiredEnvValue,
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
