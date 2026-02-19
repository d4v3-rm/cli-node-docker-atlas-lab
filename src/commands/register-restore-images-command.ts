import type { Command } from 'commander';
import type { RestoreImagesCommandOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runRestoreImagesCommand } from '../services/image-archive.service.js';

/**
 * Registers the `restore-images` command.
 */
export function registerRestoreImagesCommand(program: Command): void {
  program
    .command('restore-images')
    .description('Restore Docker images from a tar archive on disk')
    .requiredOption('--input <path>', 'Input tar archive path')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .action(async (options: RestoreImagesCommandOptions) => {
      const context = createProjectContext(options);
      await runRestoreImagesCommand(context, options);
    });
}
