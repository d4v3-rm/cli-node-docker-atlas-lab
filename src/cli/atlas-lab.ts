import process from 'node:process';
import { runCli } from './run-cli.js';
import { printError } from './ui/logger.js';

/**
 * Bootstraps the TypeScript CLI entrypoint and surfaces styled errors.
 */
runCli(process.argv).catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown CLI failure';
  printError(message, 'runtime');
  process.exitCode = 1;
});
