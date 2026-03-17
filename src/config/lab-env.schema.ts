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
    OLLAMA_RUNTIME_MODELS: optionalEnvValue,
    INVOKEAI_URL: optionalEnvValue,
    INVOKEAI_GATEWAY_USER: optionalEnvValue,
    INVOKEAI_GATEWAY_PASSWORD: optionalEnvValue,
    INVOKEAI_MODEL_REPO: optionalEnvValue,
    INVOKEAI_MODEL_REVISION: optionalEnvValue,
    INVOKEAI_MODEL_TITLE: optionalEnvValue,
    COMFYUI_URL: optionalEnvValue,
    COMFYUI_GATEWAY_USER: optionalEnvValue,
    COMFYUI_GATEWAY_PASSWORD: optionalEnvValue,
    COMFYUI_LTX_MODEL_TITLE: optionalEnvValue,
    COMFYUI_WAN_MODEL_TITLE: optionalEnvValue,
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
  GITEA_ROOT_EMAIL: requiredEnvValue
});

/**
 * Schema for workflows that require AI agents bootstrap env values.
 */
export const aiAgentsBootstrapEnvSchema = labEnvSchema.extend({
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
  GITEA_URL: requiredEnvValue
});

/**
 * Schema for AI agents smoke checks.
 */
export const aiAgentsSmokeEnvSchema = labEnvSchema.extend({
  N8N_URL: requiredEnvValue,
  N8N_ROOT_EMAIL: requiredEnvValue,
  N8N_ROOT_PASSWORD: requiredEnvValue
});

/**
 * Schema for AI LLM bootstrap workflows that reconcile the Ollama runtime.
 */
export const aiLlmBootstrapEnvSchema = labEnvSchema.extend({
  OLLAMA_EMBEDDING_MODEL: requiredEnvValue,
  OLLAMA_CHAT_MODEL: requiredEnvValue
});

/**
 * Schema for AI LLM smoke checks against Open WebUI and Ollama.
 */
export const aiLlmSmokeEnvSchema = labEnvSchema.extend({
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
 * Schema for AI image smoke checks.
 */
export const aiImageSmokeEnvSchema = labEnvSchema.extend({
  INVOKEAI_URL: requiredEnvValue,
  INVOKEAI_GATEWAY_USER: requiredEnvValue,
  INVOKEAI_GATEWAY_PASSWORD: requiredEnvValue,
  INVOKEAI_MODEL_REPO: requiredEnvValue,
  INVOKEAI_MODEL_REVISION: requiredEnvValue,
  INVOKEAI_MODEL_TITLE: requiredEnvValue
});

/**
 * Schema for AI video smoke checks.
 */
export const aiVideoSmokeEnvSchema = labEnvSchema.extend({
  COMFYUI_URL: requiredEnvValue,
  COMFYUI_GATEWAY_USER: requiredEnvValue,
  COMFYUI_GATEWAY_PASSWORD: requiredEnvValue,
  COMFYUI_LTX_MODEL_TITLE: requiredEnvValue,
  COMFYUI_WAN_MODEL_TITLE: requiredEnvValue
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
