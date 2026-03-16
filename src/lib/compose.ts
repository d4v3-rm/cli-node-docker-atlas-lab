import type { ProjectContext } from '../types/project.types.js';

export interface ComposeLayerSelection {
  includeAiLlm?: boolean;
  includeAll?: boolean;
  includeAiImage?: boolean;
  includeAiVideo?: boolean;
  includeWorkbench?: boolean;
}

/**
 * Resolves the Compose files required for the selected lab layers.
 */
export function resolveComposeFiles(
  context: ProjectContext,
  selection: ComposeLayerSelection = {}
): string[] {
  if (selection.includeAll) {
    return [
      context.layout.composeFile,
      context.layout.composeAiLlmFile,
      context.layout.composeAiImageFile,
      context.layout.composeAiVideoFile,
      context.layout.composeWorkbenchFile
    ];
  }

  return [
    context.layout.composeFile,
    ...(selection.includeAiLlm ? [context.layout.composeAiLlmFile] : []),
    ...(selection.includeAiImage ? [context.layout.composeAiImageFile] : []),
    ...(selection.includeAiVideo ? [context.layout.composeAiVideoFile] : []),
    ...(selection.includeWorkbench ? [context.layout.composeWorkbenchFile] : [])
  ];
}

/**
 * Prepends the explicit Compose files and env file required by the selected lab layers.
 */
export function createComposeCommandArgs(
  context: ProjectContext,
  commandArgs: string[],
  selection: ComposeLayerSelection = {}
): string[] {
  return [
    'compose',
    ...resolveComposeFiles(context, selection).flatMap((composeFile) => ['--file', composeFile]),
    '--env-file',
    context.layout.envFile,
    ...commandArgs
  ];
}
