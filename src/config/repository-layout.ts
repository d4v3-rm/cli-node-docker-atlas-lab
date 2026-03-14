import { join } from 'node:path';
import type { RepositoryLayout, RepositoryPathDefinitions } from '../types/repository-layout.types.js';

/**
 * Minimal files that must exist for a folder to be considered a lab checkout.
 */
export const PROJECT_MARKERS = ['infra/docker/compose.yml', 'env/lab.env'] as const;

/**
 * Files validated by the doctor command as part of the repository layout contract.
 */
export const REQUIRED_REPOSITORY_FILES = [
  'infra/docker/compose.yml',
  'infra/docker/compose.ai-llm.yml',
  'infra/docker/compose.ai-image.yml',
  'infra/docker/compose.workbench.yml',
  'env/lab.env',
  'config/gateway/templates/Caddyfile.template',
  'config/gateway/templates/Caddyfile.ai-llm.template',
  'config/gateway/templates/Caddyfile.ai-image.template',
  'config/gateway/templates/Caddyfile.workbench.template'
] as const;

/**
 * Relative path definitions for infrastructure assets consumed by the CLI.
 */
export const REPOSITORY_PATHS = {
  composeFile: 'infra/docker/compose.yml',
  composeAiLlmFile: 'infra/docker/compose.ai-llm.yml',
  composeAiImageFile: 'infra/docker/compose.ai-image.yml',
  composeWorkbenchFile: 'infra/docker/compose.workbench.yml',
  envFile: 'env/lab.env',
  gatewayTemplateFile: 'config/gateway/templates/Caddyfile.template',
  gatewayAiLlmTemplateFile: 'config/gateway/templates/Caddyfile.ai-llm.template',
  gatewayAiImageTemplateFile: 'config/gateway/templates/Caddyfile.ai-image.template',
  gatewayWorkbenchTemplateFile: 'config/gateway/templates/Caddyfile.workbench.template'
} as const satisfies RepositoryPathDefinitions;

/**
 * Resolves the repository layout to absolute paths for a discovered checkout.
 */
export function resolveRepositoryLayout(projectRoot: string): RepositoryLayout {
  return {
    composeFile: join(projectRoot, REPOSITORY_PATHS.composeFile),
    composeAiLlmFile: join(projectRoot, REPOSITORY_PATHS.composeAiLlmFile),
    composeAiImageFile: join(projectRoot, REPOSITORY_PATHS.composeAiImageFile),
    composeWorkbenchFile: join(projectRoot, REPOSITORY_PATHS.composeWorkbenchFile),
    envFile: join(projectRoot, REPOSITORY_PATHS.envFile),
    gatewayTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayTemplateFile),
    gatewayAiLlmTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayAiLlmTemplateFile),
    gatewayAiImageTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayAiImageTemplateFile),
    gatewayWorkbenchTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayWorkbenchTemplateFile)
  };
}
