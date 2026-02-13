import type { LogLevel, LogScope } from './logging.types.js';

/**
 * Supported runtime modes for the CLI launcher.
 */
export type RuntimeMode = 'development' | 'production';

/**
 * In-memory state for the optional filesystem log session.
 */
export interface FileLogSession {
  enabled: boolean;
  filePath?: string;
  projectRoot?: string;
  mode: RuntimeMode;
  initializedNow?: boolean;
}

/**
 * Structured log entry persisted during development runs.
 */
export interface FileLogEntry {
  level: LogLevel;
  scope: LogScope;
  message: string;
  timestamp: string;
}
