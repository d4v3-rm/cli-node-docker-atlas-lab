import { execa } from 'execa';
import { isFileLoggingEnabled, writeProcessOutput, writeRuntimeLog } from '../services/runtime-log.service.js';
import type { CommandExecutionOptions, CommandExecutionResult } from '../types/process.types.js';

/**
 * Runs a subprocess with CLI-friendly defaults and normalized output.
 */
export async function runCommand(
  command: string,
  args: string[],
  options: CommandExecutionOptions = {}
): Promise<CommandExecutionResult> {
  const {
    cwd,
    captureOutput = false,
    allowFailure = false,
    stdio = captureOutput ? 'pipe' : 'inherit',
    scope = 'process'
  } = options;
  const serializedCommand = formatCommand(command, args);
  const mirrorOutputToFile = shouldMirrorProcessOutput(captureOutput, stdio);

  writeRuntimeLog('info', scope, `Run command: ${serializedCommand}`);

  try {
    const result = await execa(command, args, {
      cwd,
      reject: !allowFailure,
      all: mirrorOutputToFile,
      ...(mirrorOutputToFile
        ? {
            stdin: 'inherit' as const,
            stdout: ['pipe', 'inherit'] as const,
            stderr: ['pipe', 'inherit'] as const
          }
        : {
            stdio
          }),
      windowsHide: true
    });

    persistBufferedOutput(scope, result.stdout ?? '', result.stderr ?? '');

    writeRuntimeLog('success', scope, `Command completed: ${serializedCommand} (exit=${result.exitCode ?? 0})`);

    return {
      exitCode: result.exitCode ?? 0,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? ''
    };
  } catch (error) {
    if (allowFailure && isCommandFailure(error)) {
      persistBufferedOutput(
        scope,
        error.stdout ?? '',
        error.stderr ?? error.all ?? error.originalMessage ?? error.shortMessage ?? error.message
      );

      writeRuntimeLog(
        'warn',
        scope,
        `Command returned exit=${error.exitCode ?? 1}: ${serializedCommand}`
      );

      return {
        exitCode: error.exitCode ?? 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? error.all ?? error.originalMessage ?? error.shortMessage ?? error.message
      };
    }

    if (isCommandFailure(error)) {
      persistBufferedOutput(
        scope,
        error.stdout ?? '',
        error.stderr ?? error.all ?? error.originalMessage ?? error.shortMessage ?? error.message
      );
    }

    if (isCommandFailure(error)) {
      const failureMessage = formatCommandFailure(serializedCommand, error);
      writeRuntimeLog('error', scope, failureMessage);
      throw new Error(failureMessage);
    }

    if (error instanceof Error) {
      writeRuntimeLog('error', scope, `Command failed: ${serializedCommand} | ${error.message}`);
      throw new Error(`Command failed: ${serializedCommand}\n${error.message}`);
    }

    writeRuntimeLog('error', scope, `Command failed: ${serializedCommand}`);
    throw new Error(`Command failed: ${formatCommand(command, args)}`);
  }
}

interface CommandFailureShape {
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  all?: string;
  shortMessage?: string;
  originalMessage?: string;
  cause?: unknown;
  message: string;
}

/**
 * Narrows unknown subprocess failures into the shape returned by execa.
 */
function isCommandFailure(error: unknown): error is CommandFailureShape {
  return typeof error === 'object' && error !== null && 'message' in error;
}

/**
 * Stores buffered subprocess output in the development file log.
 */
function persistBufferedOutput(
  scope: CommandExecutionOptions['scope'],
  stdout: string,
  stderr: string
): void {
  writeProcessOutput(scope ?? 'process', 'stdout', stdout);
  writeProcessOutput(scope ?? 'process', 'stderr', stderr);
}

/**
 * Decides whether the command output should be mirrored to the file logger in development mode.
 */
function shouldMirrorProcessOutput(
  captureOutput: boolean,
  stdio: CommandExecutionOptions['stdio']
): boolean {
  return !captureOutput && stdio === 'inherit' && isFileLoggingEnabled();
}

/**
 * Produces a concise, user-facing failure message without replaying the whole subprocess transcript.
 */
function formatCommandFailure(
  serializedCommand: string,
  error: CommandFailureShape
): string {
  const detail = summarizeFailureDetail(error);
  return `Command failed with exit code ${error.exitCode ?? 1}: ${serializedCommand} | ${detail}`;
}

/**
 * Extracts the most actionable line from a subprocess failure.
 */
export function summarizeFailureDetail(error: CommandFailureShape): string {
  const detailCandidates = collectFailureDetailCandidates(error);

  for (const candidate of detailCandidates) {
    const normalizedDetail = normalizeFailureCandidate(candidate);

    if (normalizedDetail !== null) {
      return normalizedDetail;
    }
  }

  return 'Unknown subprocess failure';
}

/**
 * Keeps only the actionable part of a subprocess error source.
 */
function normalizeFailureCandidate(candidate: string): string | null {
  const normalizedLines = candidate
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (let index = normalizedLines.length - 1; index >= 0; index -= 1) {
    const line = unwrapNestedCommandFailure(normalizedLines[index] ?? '');

    if (line.length === 0 || isNestedCommandFailureLine(line) || shouldIgnoreFailureLine(line)) {
      continue;
    }

    return line;
  }

  return null;
}

/**
 * Removes the wrapper added when a command failure is rethrown by this utility.
 */
function unwrapNestedCommandFailure(line: string): string {
  if (!isNestedCommandFailureLine(line)) {
    return line;
  }

  const separatorIndex = line.indexOf(' | ');

  if (separatorIndex === -1) {
    return line;
  }

  return line.slice(separatorIndex + 3).trim();
}

/**
 * Detects the standardized subprocess failure prefix emitted by this utility.
 */
function isNestedCommandFailureLine(line: string): boolean {
  return /^Command failed with exit code \d+: /u.test(line);
}

/**
 * Orders the potential error sources from most to least actionable.
 */
function collectFailureDetailCandidates(error: CommandFailureShape): string[] {
  const causeMessage = extractCauseMessage(error.cause);

  return [error.stderr, error.stdout, error.all, error.originalMessage, causeMessage, error.shortMessage, error.message]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

/**
 * Extracts a readable message from nested error causes.
 */
function extractCauseMessage(cause: unknown): string | null {
  if (cause instanceof Error) {
    return cause.message;
  }

  if (typeof cause === 'object' && cause !== null && 'message' in cause && typeof cause.message === 'string') {
    return cause.message;
  }

  return null;
}

/**
 * Skips cosmetic trailing lines that often appear after the real BuildKit/Compose failure.
 */
function shouldIgnoreFailureLine(line: string): boolean {
  return (
    /^View build details:/u.test(line) ||
    /^\[\+\] up /u.test(line) ||
    /^Dockerfile:\d+/u.test(line) ||
    /^[-]{2,}$/u.test(line) ||
    /^[-!✔✘]/u.test(line)
  );
}

/**
 * Serializes a command invocation for diagnostics.
 */
function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(' ');
}
