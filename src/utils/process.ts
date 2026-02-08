import process from 'node:process';
import { execa } from 'execa';
import { isFileLoggingEnabled, writeProcessOutput, writeRuntimeLog } from '../services/runtime-log.service.js';
import type { LogScope } from '../types/logging.types.js';
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
    const result = mirrorOutputToFile
      ? await executeWithMirroredStreams(command, args, {
          cwd,
          allowFailure,
          scope
        })
      : await execa(command, args, {
          cwd,
          reject: !allowFailure,
          stdio,
          windowsHide: true
        });

    if (!mirrorOutputToFile) {
      persistBufferedOutput(scope, result.stdout ?? '', result.stderr ?? '');
    }

    writeRuntimeLog('success', scope, `Command completed: ${serializedCommand} (exit=${result.exitCode ?? 0})`);

    return {
      exitCode: result.exitCode ?? 0,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? ''
    };
  } catch (error) {
    if (allowFailure && isCommandFailure(error)) {
      if (!mirrorOutputToFile) {
        persistBufferedOutput(
          scope,
          error.stdout ?? '',
          error.stderr ?? error.shortMessage ?? error.message
        );
      }

      writeRuntimeLog(
        'warn',
        scope,
        `Command returned exit=${error.exitCode ?? 1}: ${serializedCommand}`
      );

      return {
        exitCode: error.exitCode ?? 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? error.shortMessage ?? error.message
      };
    }

    if (isCommandFailure(error) && !mirrorOutputToFile) {
      persistBufferedOutput(scope, error.stdout ?? '', error.stderr ?? error.shortMessage ?? error.message);
    }

    if (error instanceof Error) {
      writeRuntimeLog('error', scope, `Command failed: ${serializedCommand} | ${error.message}`);
      throw new Error(error.message);
    }

    writeRuntimeLog('error', scope, `Command failed: ${serializedCommand}`);
    throw new Error(`Command failed: ${formatCommand(command, args)}`);
  }
}

interface CommandFailureShape {
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  shortMessage?: string;
  message: string;
}

/**
 * Executes an inherited command while teeing stdout and stderr into the development log file.
 */
async function executeWithMirroredStreams(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    allowFailure: boolean;
    scope: LogScope;
  }
): Promise<CommandExecutionResult> {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const subprocess = execa(command, args, {
    cwd: options.cwd,
    reject: !options.allowFailure,
    stdin: 'inherit',
    stdout: 'pipe',
    stderr: 'pipe',
    windowsHide: true
  });

  attachOutputMirror(subprocess.stdout, process.stdout, stdoutChunks, options.scope, 'stdout');
  attachOutputMirror(subprocess.stderr, process.stderr, stderrChunks, options.scope, 'stderr');

  const result = await subprocess;

  return {
    exitCode: result.exitCode ?? 0,
    stdout: stdoutChunks.join('') || (result.stdout ?? ''),
    stderr: stderrChunks.join('') || (result.stderr ?? '')
  };
}

/**
 * Mirrors subprocess output to the terminal while writing the same chunks into the file log.
 */
function attachOutputMirror(
  stream: NodeJS.ReadableStream | null | undefined,
  destination: NodeJS.WritableStream,
  chunks: string[],
  scope: LogScope,
  streamName: 'stdout' | 'stderr'
): void {
  stream?.on('data', (chunk) => {
    const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    chunks.push(text);
    destination.write(text);
    writeProcessOutput(scope, streamName, text);
  });
}

/**
 * Stores buffered subprocess output when the command was executed without stream mirroring.
 */
function persistBufferedOutput(scope: LogScope, stdout: string, stderr: string): void {
  writeProcessOutput(scope, 'stdout', stdout);
  writeProcessOutput(scope, 'stderr', stderr);
}

/**
 * Narrows unknown subprocess failures into the shape returned by execa.
 */
function isCommandFailure(error: unknown): error is CommandFailureShape {
  return typeof error === 'object' && error !== null && 'message' in error;
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
 * Serializes a command invocation for diagnostics.
 */
function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(' ');
}
