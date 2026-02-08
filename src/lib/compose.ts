import type { ProjectContext } from '../types/project.types.js';

/**
 * Prepends the explicit Compose file and env file required by the project layout.
 */
export function createComposeCommandArgs(
  context: ProjectContext,
  commandArgs: string[]
): string[] {
  return [
    'compose',
    '--file',
    context.layout.composeFile,
    '--env-file',
    context.layout.envFile,
    ...commandArgs
  ];
}
