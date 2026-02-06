import type { Command } from 'commander';
import type { GlobalCliOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runDownCommand } from '../services/stack.service.js';

/**
 * Registers the `down` command.
 */
export function registerDownCommand(program: Command): void {
  program
    .command('down')
    .description('Stop the lab stack')
    .option('--project-dir <path>', 'Explicit project root if you are not in the repo')
    .action(async (options: GlobalCliOptions) => {
      const context = createProjectContext(options);
      await runDownCommand(context, options);
    });
}
