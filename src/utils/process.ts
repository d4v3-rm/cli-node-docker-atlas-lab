import { execa } from 'execa';
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
    stdio = captureOutput ? 'pipe' : 'inherit'
  } = options;

  try {
    const result = await execa(command, args, {
      cwd,
      reject: !allowFailure,
      stdio,
      windowsHide: true
    });

    return {
      exitCode: result.exitCode ?? 0,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? ''
    };
  } catch (error) {
    if (allowFailure && isCommandFailure(error)) {
      return {
        exitCode: error.exitCode ?? 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? error.shortMessage ?? error.message
      };
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

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
 * Narrows unknown subprocess failures into the shape returned by execa.
 */
function isCommandFailure(error: unknown): error is CommandFailureShape {
  return typeof error === 'object' && error !== null && 'message' in error;
}

/**
 * Serializes a command invocation for diagnostics.
 */
function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(' ');
}
