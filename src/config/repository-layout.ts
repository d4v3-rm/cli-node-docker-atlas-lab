import { join } from 'node:path';
import type { RepositoryLayout, RepositoryPathDefinitions } from '../types/repository-layout.types.js';

/**
 * Minimal files that must exist for a folder to be considered a lab checkout.
 */
export const PROJECT_MARKERS = ['infra/docker/compose.yml', 'config/env/lab.env'] as const;

/**
 * Files validated by the doctor command as part of the repository layout contract.
 */
export const REQUIRED_REPOSITORY_FILES = [
  'infra/docker/compose.yml',
  'config/env/lab.env',
  'config/gateway/templates/Caddyfile.template',
  'config/gateway/templates/Caddyfile.workbench.template'
] as const;

/**
 * Relative path definitions for infrastructure assets consumed by the CLI.
 */
export const REPOSITORY_PATHS = {
  composeFile: 'infra/docker/compose.yml',
  envFile: 'config/env/lab.env',
  gatewayTemplateFile: 'config/gateway/templates/Caddyfile.template'
} as const satisfies RepositoryPathDefinitions;

/**
 * Resolves the repository layout to absolute paths for a discovered checkout.
 */
export function resolveRepositoryLayout(projectRoot: string): RepositoryLayout {
  return {
    composeFile: join(projectRoot, REPOSITORY_PATHS.composeFile),
    envFile: join(projectRoot, REPOSITORY_PATHS.envFile),
    gatewayTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayTemplateFile)
  };
}
