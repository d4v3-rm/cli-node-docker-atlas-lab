import type { Command } from 'commander';
import { createCliApp } from './create-cli-app.js';

/**
 * Parses the incoming argv with Commander and runs the selected command.
 */
export async function runCli(argv: string[]): Promise<void> {
  const program: Command = createCliApp();
  await program.parseAsync(argv);
}
