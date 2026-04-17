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
  N8N_ROOT_FIRST_NAME?: string;
  N8N_ROOT_LAST_NAME?: string;
  N8N_ROOT_EMAIL?: string;
  N8N_ROOT_PASSWORD?: string;
  PLANE_ROOT_NAME?: string;
  PLANE_ROOT_EMAIL?: string;
  PLANE_ROOT_PASSWORD?: string;
  PLANE_INSTANCE_NAME?: string;
  OPENWEBUI_ROOT_EMAIL?: string;
  OPENWEBUI_ROOT_PASSWORD?: string;
  PENPOT_ROOT_NAME?: string;
  PENPOT_ROOT_EMAIL?: string;
  PENPOT_ROOT_PASSWORD?: string;
  NEXTCLOUD_AIO_ROOT_USERNAME?: string;
  NEXTCLOUD_AIO_ROOT_PASSWORD?: string;
  OLLAMA_EMBEDDING_MODEL?: string;
  OLLAMA_CHAT_MODEL?: string;
  OLLAMA_RUNTIME_MODELS?: string;
  POSTGRES_DEV_HOST_PORT?: string;
  LAB_URL?: string;
  GITEA_URL?: string;
  N8N_URL?: string;
  PLANE_URL?: string;
  OPENWEBUI_URL?: string;
  OLLAMA_URL?: string;
  PENPOT_URL?: string;
  NEXTCLOUD_AIO_URL?: string;
  NEXTCLOUD_AIO_SETUP_URL?: string;
  OLLAMA_GATEWAY_USER?: string;
  OLLAMA_GATEWAY_PASSWORD?: string;
  ATLAS_DOCKER_HUB_MIRRORS?: string;
  ATLAS_REGISTRY_PROXIES?: string;
  CADDY_VERSION?: string;
  OLLAMA_VERSION?: string;
  NODE_DEV_BASE_IMAGE?: string;
  PYTHON_DEV_BASE_IMAGE?: string;
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
  PLANE_ROOT_NAME: string;
  PLANE_ROOT_EMAIL: string;
  PLANE_ROOT_PASSWORD: string;
  PLANE_INSTANCE_NAME: string;
  PENPOT_ROOT_NAME: string;
  PENPOT_ROOT_EMAIL: string;
  PENPOT_ROOT_PASSWORD: string;
}

/**
 * Env shape guaranteed after AI LLM bootstrap validation.
 */
export interface AiLlmBootstrapEnv extends LabEnv {
  N8N_URL: string;
  N8N_ROOT_FIRST_NAME: string;
  N8N_ROOT_LAST_NAME: string;
  N8N_ROOT_EMAIL: string;
  N8N_ROOT_PASSWORD: string;
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
  N8N_URL: string;
  N8N_ROOT_EMAIL: string;
  N8N_ROOT_PASSWORD: string;
  OPENWEBUI_URL: string;
  OPENWEBUI_ROOT_EMAIL: string;
  OPENWEBUI_ROOT_PASSWORD: string;
  OLLAMA_URL: string;
  OLLAMA_GATEWAY_USER: string;
  OLLAMA_GATEWAY_PASSWORD: string;
  OLLAMA_EMBEDDING_MODEL: string;
  OLLAMA_CHAT_MODEL: string;
}
