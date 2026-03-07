import type { Command } from 'commander';
import type { BootstrapCommandOptions } from '../types/cli.types.js';
import { runBootstrapCommand } from '../services/bootstrap.service.js';
import { createProjectContext } from '../services/project.service.js';

/**
 * Registers the `bootstrap` command.
 */
export function registerBootstrapCommand(program: Command): void {
  program
    .command('bootstrap')
    .description('Run the idempotent bootstrap only')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .option('--with-ai-llm, --with-ai', 'Include the optional AI LLM bootstrap (Ollama models)')
    .option('--skip-gitea', 'Skip the Gitea admin reconciliation step')
    .option('--skip-ollama', 'Skip the Ollama model reconciliation step')
    .action(async (options: BootstrapCommandOptions) => {
      const context = createProjectContext(options);
      await runBootstrapCommand(context, options);
    });
}
