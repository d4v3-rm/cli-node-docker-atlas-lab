import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { EOL } from 'node:os';
import { stripVTControlCharacters } from 'node:util';
import { APP_METADATA } from '../../config/app-metadata.js';
import { getRuntimeMode, isDevelopmentRuntime } from '../../config/runtime-mode.js';
import type { LogLevel, LogScope } from '../../types/logging.types.js';
import type { FileLogEntry, FileLogSession } from '../../types/runtime.types.js';

const fileLogSession: FileLogSession = {
  enabled: false,
  mode: getRuntimeMode(),
  initializedNow: false
};

/**
 * Enables filesystem logging for development runs once the project root is known.
 */
export function ensureDevelopmentFileLogging(projectRoot: string): FileLogSession {
  if (!isDevelopmentRuntime()) {
    return {
      ...fileLogSession,
      initializedNow: false
    };
  }

  if (fileLogSession.enabled && fileLogSession.projectRoot === projectRoot) {
    return {
      ...fileLogSession,
      initializedNow: false
    };
  }

  const logDirectory = join(projectRoot, 'logs', 'dev');
  const timestamp = createLogTimestamp();
  const filePath = join(logDirectory, `${APP_METADATA.cliName}-${timestamp}.log`);

  mkdirSync(logDirectory, { recursive: true });

  fileLogSession.enabled = true;
  fileLogSession.filePath = filePath;
  fileLogSession.projectRoot = projectRoot;
  fileLogSession.mode = 'development';
  fileLogSession.initializedNow = true;

  appendLines(
    [
      `# ${APP_METADATA.displayName} development log`,
      `# projectRoot=${projectRoot}`,
      `# createdAt=${new Date().toISOString()}`
    ].join(EOL)
  );

  return { ...fileLogSession };
}

/**
 * Reports whether the current process has an active file log session.
 */
export function isFileLoggingEnabled(): boolean {
  return Boolean(fileLogSession.enabled && fileLogSession.filePath);
}

/**
 * Persists a structured runtime log entry when development file logging is active.
 */
export function writeRuntimeLog(level: LogLevel, scope: LogScope, message: string): void {
  if (!isFileLoggingEnabled()) {
    return;
  }

  const entry: FileLogEntry = {
    level,
    scope,
    message,
    timestamp: new Date().toISOString()
  };

  appendLines(formatLogEntry(entry));
}

/**
 * Persists raw subprocess output while keeping multiline output readable in the log file.
 */
export function writeProcessOutput(
  scope: LogScope,
  stream: 'stdout' | 'stderr',
  output: string
): void {
  if (!output.trim() || !isFileLoggingEnabled()) {
    return;
  }

  const level: LogLevel = stream === 'stderr' ? 'warn' : 'debug';
  const prefixedOutput = output
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => `[${stream}] ${stripVTControlCharacters(line)}`)
    .join(EOL);

  writeRuntimeLog(level, scope, prefixedOutput);
}

/**
 * Produces a filesystem-safe timestamp for per-run log files.
 */
function createLogTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}

/**
 * Renders a structured log entry as a plain-text line suitable for file persistence.
 */
function formatLogEntry(entry: FileLogEntry): string {
  const normalizedMessage = stripVTControlCharacters(entry.message);
  return normalizedMessage
    .split('\n')
    .map((line) => `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.scope}] ${line}`)
    .join(EOL);
}

/**
 * Appends one or more lines to the active file log session.
 */
function appendLines(content: string): void {
  if (!fileLogSession.filePath) {
    return;
  }

  mkdirSync(dirname(fileLogSession.filePath), { recursive: true });
  appendFileSync(fileLogSession.filePath, `${content}${EOL}`, 'utf8');
}
