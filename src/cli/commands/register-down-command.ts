import type { Command } from 'commander';
import type { GlobalCliOptions } from '../../types/cli.types.js';
import { createProjectContext } from '../../services/runtime/project.service.js';
import { runDownCommand } from '../../services/orchestration/stack.service.js';

/**
 * Registers the `down` command.
 */
export function registerDownCommand(program: Command): void {
  program
    .command('down')
    .description('Stop the lab stack')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .action(async (options: GlobalCliOptions) => {
      const context = createProjectContext(options);
      await runDownCommand(context, options);
    });
}
