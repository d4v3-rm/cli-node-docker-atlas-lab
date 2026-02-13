/**
 * Supported logging levels rendered by the CLI.
 */
export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

/**
 * High-level scopes used to group runtime logs and task titles.
 */
export type LogScope =
  | 'app'
  | 'runtime'
  | 'stack'
  | 'bootstrap'
  | 'doctor'
  | 'host'
  | 'smoke'
  | 'compose'
  | 'process';
