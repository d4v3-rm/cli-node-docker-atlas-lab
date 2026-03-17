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
  'infra/docker/compose.ai-agents.yml',
  'infra/docker/compose.ai-image.yml',
  'infra/docker/compose.ai-video.yml',
  'infra/docker/compose.workbench.yml',
  'env/lab.env',
  'config/models/invokeai-models.json',
  'config/models/comfyui-models.json',
  'config/gateway/templates/Caddyfile.template',
  'config/gateway/templates/Caddyfile.ai-llm.template',
  'config/gateway/templates/Caddyfile.ai-agents.template',
  'config/gateway/templates/Caddyfile.ai-image.template',
  'config/gateway/templates/Caddyfile.ai-video.template',
  'config/gateway/templates/Caddyfile.workbench.template',
  'config/gateway/templates/content/comfyui.md.template',
  'infra/docker/images/model-sync/sync-ollama-models.sh'
] as const;

/**
 * Relative path definitions for infrastructure assets consumed by the CLI.
 */
export const REPOSITORY_PATHS = {
  composeFile: 'infra/docker/compose.yml',
  composeAiLlmFile: 'infra/docker/compose.ai-llm.yml',
  composeAiAgentsFile: 'infra/docker/compose.ai-agents.yml',
  composeAiImageFile: 'infra/docker/compose.ai-image.yml',
  composeAiVideoFile: 'infra/docker/compose.ai-video.yml',
  composeWorkbenchFile: 'infra/docker/compose.workbench.yml',
  envFile: 'env/lab.env',
  gatewayTemplateFile: 'config/gateway/templates/Caddyfile.template',
  gatewayAiLlmTemplateFile: 'config/gateway/templates/Caddyfile.ai-llm.template',
  gatewayAiAgentsTemplateFile: 'config/gateway/templates/Caddyfile.ai-agents.template',
  gatewayAiImageTemplateFile: 'config/gateway/templates/Caddyfile.ai-image.template',
  gatewayAiVideoTemplateFile: 'config/gateway/templates/Caddyfile.ai-video.template',
  gatewayWorkbenchTemplateFile: 'config/gateway/templates/Caddyfile.workbench.template'
} as const satisfies RepositoryPathDefinitions;

/**
 * Resolves the repository layout to absolute paths for a discovered checkout.
 */
export function resolveRepositoryLayout(projectRoot: string): RepositoryLayout {
  return {
    composeFile: join(projectRoot, REPOSITORY_PATHS.composeFile),
    composeAiLlmFile: join(projectRoot, REPOSITORY_PATHS.composeAiLlmFile),
    composeAiAgentsFile: join(projectRoot, REPOSITORY_PATHS.composeAiAgentsFile),
    composeAiImageFile: join(projectRoot, REPOSITORY_PATHS.composeAiImageFile),
    composeAiVideoFile: join(projectRoot, REPOSITORY_PATHS.composeAiVideoFile),
    composeWorkbenchFile: join(projectRoot, REPOSITORY_PATHS.composeWorkbenchFile),
    envFile: join(projectRoot, REPOSITORY_PATHS.envFile),
    gatewayTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayTemplateFile),
    gatewayAiLlmTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayAiLlmTemplateFile),
    gatewayAiAgentsTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayAiAgentsTemplateFile),
    gatewayAiImageTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayAiImageTemplateFile),
    gatewayAiVideoTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayAiVideoTemplateFile),
    gatewayWorkbenchTemplateFile: join(projectRoot, REPOSITORY_PATHS.gatewayWorkbenchTemplateFile)
  };
}
