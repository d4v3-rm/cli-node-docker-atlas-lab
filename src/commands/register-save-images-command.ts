import type { Command } from 'commander';
import type { SaveImagesCommandOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runSaveImagesCommand } from '../services/image-archive.service.js';
import { normalizeAiAliasOptions } from '../utils/cli-options.js';

/**
 * Registers the `save-images` command.
 */
export function registerSaveImagesCommand(program: Command): void {
  program
    .command('save-images')
    .description('Save Docker images for the selected lab layers into a single archive')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .option('--output <path>', 'Output archive path (defaults under ./backups/images)')
    .option('--with-ai-llm, --with-ai', 'Include the optional AI LLM layer images')
    .option('--with-workbench', 'Include the optional workbench layer images')
    .action(async (options: SaveImagesCommandOptions) => {
      const normalizedOptions = normalizeAiAliasOptions(options);
      const context = createProjectContext(normalizedOptions);
      await runSaveImagesCommand(context, normalizedOptions);
    });
}
