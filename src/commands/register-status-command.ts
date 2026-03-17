import type { Command } from 'commander';
import type { GlobalCliOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runStatusCommand } from '../services/stack.service.js';

/**
 * Registers the `status` command.
 */
export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show Docker Compose status')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .action(async (options: GlobalCliOptions) => {
      const context = createProjectContext(options);
      await runStatusCommand(context, options);
    });
}
