import type { Command } from 'commander';
import type { DoctorCommandOptions } from '../types/cli.types.js';
import { runDoctorCommand } from '../services/doctor.service.js';
import { createProjectContext } from '../services/project.service.js';
import { normalizeAiAliasOptions } from '../utils/cli-options.js';

/**
 * Registers the `doctor` command.
 */
export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check host requirements and optionally run smoke tests')
    .option('--project-dir <path>', 'Explicit lab asset root instead of the packaged install')
    .option('--with-ai-llm, --with-ai', 'Include the optional AI LLM layer checks')
    .option('--with-ai-image, --with-image', 'Include the optional AI image layer checks')
    .option('--with-ai-video', 'Include the optional AI video layer checks')
    .option('--with-workbench', 'Validate the optional workbench Compose layer')
    .option('--smoke', 'Run smoke checks against the local HTTPS endpoints')
    .action(async (options: DoctorCommandOptions) => {
      const normalizedOptions = normalizeAiAliasOptions(options);
      const context = createProjectContext(normalizedOptions);
      await runDoctorCommand(context, normalizedOptions);
    });
}
