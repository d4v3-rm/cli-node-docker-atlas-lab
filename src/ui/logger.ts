import boxen from 'boxen';
import pc from 'picocolors';
import type { HostCheckResult } from '../types/doctor.types.js';

/**
 * Prints a success line with consistent styling.
 */
export function printSuccess(message: string): void {
  console.log(`${pc.green('done')} ${message}`);
}

/**
 * Prints an informational line with consistent styling.
 */
export function printInfo(message: string): void {
  console.log(`${pc.cyan('info')} ${message}`);
}

/**
 * Prints an error panel that stays visible even after task renderers exit.
 */
export function printError(message: string): void {
  console.error(
    boxen(pc.red(message), {
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
  const rows = results.map((result) => {
    const status = result.ok ? pc.green('PASS') : pc.red('FAIL');
    return `${status} ${result.name}: ${pc.dim(result.detail)}`;
  });

  console.log(
    boxen(
      [
        pc.bold('Doctor Summary'),
        `${pc.green(String(passedChecks))} passed`,
        `${failedChecks > 0 ? pc.red(String(failedChecks)) : pc.dim('0')} failed`,
        '',
        ...rows
      ].join('\n'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: failedChecks > 0 ? 'yellow' : 'green'
      }
    )
  );
}
