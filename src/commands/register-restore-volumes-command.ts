import type { Command } from 'commander';
import type { RestoreVolumesCommandOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runRestoreVolumesCommand } from '../services/volume-archive.service.js';

/**
 * Registers the `restore-volumes` command.
 */
export function registerRestoreVolumesCommand(program: Command): void {
  program
    .command('restore-volumes')
    .description('Restore Docker volumes from an archive directory on disk')
    .requiredOption('--input-dir <path>', 'Input volume archive directory')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .action(async (options: RestoreVolumesCommandOptions) => {
      const context = createProjectContext(options);
      await runRestoreVolumesCommand(context, options);
    });
}
