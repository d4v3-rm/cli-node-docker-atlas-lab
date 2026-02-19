import type { Command } from 'commander';
import type { SaveVolumesCommandOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runSaveVolumesCommand } from '../services/volume-archive.service.js';

/**
 * Registers the `save-volumes` command.
 */
export function registerSaveVolumesCommand(program: Command): void {
  program
    .command('save-volumes')
    .description('Save Docker volumes for the selected lab layers to disk')
    .option('--project-dir <path>', 'Explicit project root if you are not in the repo')
    .option('--output-dir <path>', 'Output directory path (defaults under backups/volumes)')
    .option('--with-ai', 'Include the optional AI layer volumes')
    .option('--with-workbench', 'Include the optional workbench layer volumes')
    .action(async (options: SaveVolumesCommandOptions) => {
      const context = createProjectContext(options);
      await runSaveVolumesCommand(context, options);
    });
}
