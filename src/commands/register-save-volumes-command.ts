import type { Command } from 'commander';
import type { SaveVolumesCommandOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runSaveVolumesCommand } from '../services/volume-archive.service.js';
import { normalizeAiAliasOptions } from '../utils/cli-options.js';

/**
 * Registers the `save-volumes` command.
 */
export function registerSaveVolumesCommand(program: Command): void {
  program
    .command('save-volumes')
    .description('Save Docker volumes for the selected lab layers into a single archive')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .option('--output <path>', 'Output archive path (defaults under ./backups/volumes)')
    .option('--with-ai-llm, --with-ai', 'Include the optional AI LLM layer volumes')
    .option('--with-ai-image, --with-image', 'Include the optional AI image layer volumes')
    .option('--with-workbench', 'Include the optional workbench layer volumes')
    .action(async (options: SaveVolumesCommandOptions) => {
      const normalizedOptions = normalizeAiAliasOptions(options);
      const context = createProjectContext(normalizedOptions);
      await runSaveVolumesCommand(context, normalizedOptions);
    });
}
