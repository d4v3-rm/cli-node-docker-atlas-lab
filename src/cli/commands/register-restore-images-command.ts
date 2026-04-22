import type { Command } from 'commander';
import type { RestoreImagesCommandOptions } from '../../types/cli.types.js';
import { createProjectContext } from '../../services/runtime/project.service.js';
import { runRestoreImagesCommand } from '../../services/archive/image-archive.service.js';

/**
 * Registers the `restore-images` command.
 */
export function registerRestoreImagesCommand(program: Command): void {
  program
    .command('restore-images')
    .description('Restore Docker images from a single archive on disk')
    .requiredOption('--input <path>', 'Input image archive path')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .action(async (options: RestoreImagesCommandOptions) => {
      const context = createProjectContext(options);
      await runRestoreImagesCommand(context, options);
    });
}
