import boxen from 'boxen';
import Table from 'cli-table3';
import logSymbols from 'log-symbols';
import pc from 'picocolors';
import { APP_METADATA } from '../config/app-metadata.js';
import { writeRuntimeLog } from '../services/runtime-log.service.js';
import type { HostCheckResult } from '../types/doctor.types.js';
import type { LogLevel, LogScope } from '../types/logging.types.js';

/**
 * Prints a success line with consistent styling.
 */
export function printSuccess(message: string, scope: LogScope = 'app'): void {
  printLogLine('success', message, scope);
}

/**
 * Prints an informational line with consistent styling.
 */
export function printInfo(message: string, scope: LogScope = 'app'): void {
  printLogLine('info', message, scope);
}

/**
 * Prints an error panel that stays visible even after task renderers exit.
 */
export function printError(message: string, scope: LogScope = 'app'): void {
  writeRuntimeLog('error', scope, message);

  console.error(
    boxen([formatScopeLabel(scope), pc.red(message)].join('\n'), {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'red'
    })
  );
}

/**
 * Prints a compact summary for `doctor` once all checks have run.
 */
export function printDoctorSummary(results: HostCheckResult[]): void {
  const passedChecks = results.filter((result) => result.ok).length;
  const failedChecks = results.length - passedChecks;
  const table = new Table({
    head: ['Status', 'Check', 'Detail'],
    wordWrap: true,
    style: {
      head: ['cyan']
    },
    colWidths: [10, 32, 66]
  });

  for (const result of results) {
    table.push([
      result.ok ? logSymbols.success : logSymbols.error,
      result.name,
      result.detail
    ]);
  }

  writeRuntimeLog(
    failedChecks > 0 ? 'warn' : 'success',
    'doctor',
    `Doctor summary: ${passedChecks} passed, ${failedChecks} failed`
  );

  console.log(
    boxen(
      [
        `${formatScopeLabel('doctor')} ${pc.bold('Summary')}`,
        `${pc.green(String(passedChecks))} passed`,
        `${failedChecks > 0 ? pc.red(String(failedChecks)) : pc.dim('0')} failed`,
        '',
        table.toString()
      ].join('\n'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: failedChecks > 0 ? 'yellow' : 'green'
      }
    )
  );
}

/**
 * Formats a colored scope label for task renderers and inline logs.
 */
export function formatScopeLabel(scope: LogScope): string {
  return pc.bold(getScopeColor(scope)(`[${APP_METADATA.cliName}:${scope}]`));
}

/**
 * Prefixes a task title with a colored scope label.
 */
export function formatTaskTitle(scope: LogScope, title: string): string {
  return `${formatScopeLabel(scope)} ${title}`;
}

/**
 * Renders a single structured log line with level symbols and scope prefixes.
 */
function printLogLine(level: LogLevel, message: string, scope: LogScope): void {
  writeRuntimeLog(level, scope, message);

  const line = `${getLevelSymbol(level)} ${formatScopeLabel(scope)} ${getLevelColor(level)(message)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  console.log(line);
}

/**
 * Resolves the scope palette so related logs keep a stable visual identity.
 */
function getScopeColor(scope: LogScope): (text: string) => string {
  switch (scope) {
    case 'runtime':
      return pc.magenta;
    case 'stack':
      return pc.cyan;
    case 'bootstrap':
      return pc.magenta;
    case 'doctor':
      return pc.green;
    case 'host':
      return pc.blue;
    case 'smoke':
      return pc.yellow;
    case 'compose':
      return pc.cyan;
    case 'process':
      return pc.white;
    case 'app':
    default:
      return pc.blue;
  }
}

/**
 * Resolves the message color associated with a log level.
 */
function getLevelColor(level: LogLevel): (text: string) => string {
  switch (level) {
    case 'success':
      return pc.green;
    case 'warn':
      return pc.yellow;
    case 'error':
      return pc.red;
    case 'debug':
      return pc.dim;
    case 'info':
    default:
      return pc.white;
  }
}

/**
 * Maps the log level to a terminal symbol.
 */
function getLevelSymbol(level: LogLevel): string {
  switch (level) {
    case 'success':
      return logSymbols.success;
    case 'warn':
      return logSymbols.warning;
    case 'error':
      return logSymbols.error;
    case 'info':
    case 'debug':
    default:
      return logSymbols.info;
  }
}
