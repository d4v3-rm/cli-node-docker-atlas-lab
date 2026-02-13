import type { LogScope } from './logging.types.js';

/**
 * Options for subprocess execution.
 */
export interface CommandExecutionOptions {
  cwd?: string;
  captureOutput?: boolean;
  allowFailure?: boolean;
  stdio?: 'inherit' | 'pipe' | 'ignore';
  scope?: LogScope;
}

/**
 * Normalized subprocess result consumed by services.
 */
export interface CommandExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}
