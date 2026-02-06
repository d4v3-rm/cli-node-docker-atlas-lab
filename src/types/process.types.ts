/**
 * Options for subprocess execution.
 */
export interface CommandExecutionOptions {
  cwd?: string;
  captureOutput?: boolean;
  allowFailure?: boolean;
  stdio?: 'inherit' | 'pipe' | 'ignore';
}

/**
 * Normalized subprocess result consumed by services.
 */
export interface CommandExecutionResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}
