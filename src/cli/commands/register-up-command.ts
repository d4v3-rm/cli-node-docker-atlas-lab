import type { Command } from 'commander';
import type { UpCommandOptions } from '../../types/cli.types.js';
import { createProjectContext } from '../../services/runtime/project.service.js';
import { runUpCommand } from '../../services/orchestration/stack.service.js';
import { normalizeAiAliasOptions } from '../../utils/cli-options.js';

/**
 * Registers the `up` command.
 */
export function registerUpCommand(program: Command): void {
  program
    .command('up')
    .description('Start Docker Compose, run bootstrap, and clean legacy artifacts')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .option('--build', 'Rebuild images before starting the stack')
    .option('--with-ai-llm, --with-ai', 'Include the optional AI LLM layer (Open WebUI and Ollama)')
    .option('--skip-ollama', 'Skip the Ollama model reconciliation step after startup')
    .option('--with-workbench', 'Include the optional workbench profile')
    .action(async (options: UpCommandOptions) => {
      const normalizedOptions = normalizeAiAliasOptions(options);
      const context = createProjectContext(normalizedOptions);
      await runUpCommand(context, normalizedOptions);
    });
}
