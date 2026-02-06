/**
 * Typed view of the `.env` values consumed by the CLI.
 */
export interface LabEnv {
  [key: string]: string | undefined;
  GITEA_UID?: string;
  GITEA_GID?: string;
  GITEA_ROOT_USERNAME?: string;
  GITEA_ROOT_PASSWORD?: string;
  GITEA_ROOT_EMAIL?: string;
  OLLAMA_EMBEDDING_MODEL?: string;
  LAB_URL?: string;
  GITEA_URL?: string;
  N8N_URL?: string;
  OPENWEBUI_URL?: string;
  OLLAMA_URL?: string;
  N8N_GATEWAY_USER?: string;
  N8N_GATEWAY_PASSWORD?: string;
  OLLAMA_GATEWAY_USER?: string;
  OLLAMA_GATEWAY_PASSWORD?: string;
}

/**
 * Resolved runtime context for commands that act on a project checkout.
 */
export interface ProjectContext {
  projectRoot: string;
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
 * Keys required by the bootstrap workflow.
 */
export type BootstrapEnvKey =
  | 'GITEA_UID'
  | 'GITEA_GID'
  | 'GITEA_ROOT_USERNAME'
  | 'GITEA_ROOT_PASSWORD'
  | 'GITEA_ROOT_EMAIL'
  | 'OLLAMA_EMBEDDING_MODEL';

/**
 * Env shape guaranteed after bootstrap validation.
 */
export type BootstrapEnv = LabEnv & Required<Pick<LabEnv, BootstrapEnvKey>>;

/**
 * Keys required by smoke checks.
 */
export type SmokeEnvKey =
  | 'LAB_URL'
  | 'GITEA_URL'
  | 'N8N_URL'
  | 'OPENWEBUI_URL'
  | 'OLLAMA_URL'
  | 'N8N_GATEWAY_USER'
  | 'N8N_GATEWAY_PASSWORD'
  | 'OLLAMA_GATEWAY_USER'
  | 'OLLAMA_GATEWAY_PASSWORD';

/**
 * Env shape guaranteed after smoke-check validation.
 */
export type SmokeEnv = LabEnv & Required<Pick<LabEnv, SmokeEnvKey>>;
