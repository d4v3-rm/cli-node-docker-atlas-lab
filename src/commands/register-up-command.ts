import type { Command } from 'commander';
import type { UpCommandOptions } from '../types/cli.types.js';
import { createProjectContext } from '../services/project.service.js';
import { runUpCommand } from '../services/stack.service.js';

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
    .option(
      '--with-ai-image, --with-image',
      'Include the optional AI image layer (InvokeAI, SwarmUI, Fooocus, and their paired runtimes)'
    )
    .option('--with-workbench', 'Include the optional workbench profile')
    .action(async (options: UpCommandOptions) => {
      const context = createProjectContext(options);
      await runUpCommand(context, options);
    });
}
