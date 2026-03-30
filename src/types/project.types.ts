import type { RepositoryLayout } from './repository-layout.types.js';

/**
 * Typed view of the `env/lab.env` values consumed by the CLI.
 */
export interface LabEnv {
  [key: string]: string | undefined;
  GITEA_UID?: string;
  GITEA_GID?: string;
  GITEA_ROOT_USERNAME?: string;
  GITEA_ROOT_PASSWORD?: string;
  GITEA_ROOT_EMAIL?: string;
  OPENWEBUI_ROOT_EMAIL?: string;
  OPENWEBUI_ROOT_PASSWORD?: string;
  OLLAMA_EMBEDDING_MODEL?: string;
  OLLAMA_CHAT_MODEL?: string;
  OLLAMA_RUNTIME_MODELS?: string;
  POSTGRES_DEV_HOST_PORT?: string;
  LAB_URL?: string;
  GITEA_URL?: string;
  OPENWEBUI_URL?: string;
  OLLAMA_URL?: string;
  OLLAMA_GATEWAY_USER?: string;
  OLLAMA_GATEWAY_PASSWORD?: string;
}

/**
 * Resolved runtime context for commands that act on a project checkout.
 */
export interface ProjectContext {
  projectRoot: string;
  runtimeSource: 'checkout' | 'explicit-path' | 'packaged-install';
  workingDirectory: string;
  layout: RepositoryLayout;
  env: LabEnv;
}

/**
 * Basic auth credentials used by smoke checks.
 */
export interface BasicAuthCredentials {
  username: string;
  password: string;
}

/**
 * Env shape guaranteed after bootstrap validation.
 */
export interface BootstrapEnv extends LabEnv {
  GITEA_UID: string;
  GITEA_GID: string;
  GITEA_ROOT_USERNAME: string;
  GITEA_ROOT_PASSWORD: string;
  GITEA_ROOT_EMAIL: string;
}

/**
 * Env shape guaranteed after AI LLM bootstrap validation.
 */
export interface AiLlmBootstrapEnv extends LabEnv {
  OLLAMA_EMBEDDING_MODEL: string;
  OLLAMA_CHAT_MODEL: string;
}

/**
 * Env shape guaranteed after smoke-check validation.
 */
export interface SmokeEnv extends LabEnv {
  LAB_URL: string;
  GITEA_URL: string;
}

/**
 * Env shape guaranteed after AI LLM smoke-check validation.
 */
export interface AiLlmSmokeEnv extends LabEnv {
  OPENWEBUI_URL: string;
  OPENWEBUI_ROOT_EMAIL: string;
  OPENWEBUI_ROOT_PASSWORD: string;
  OLLAMA_URL: string;
  OLLAMA_GATEWAY_USER: string;
  OLLAMA_GATEWAY_PASSWORD: string;
  OLLAMA_EMBEDDING_MODEL: string;
  OLLAMA_CHAT_MODEL: string;
}
