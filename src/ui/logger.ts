import boxen from 'boxen';
import Table from 'cli-table3';
import { consola } from 'consola';
import logSymbols from 'log-symbols';
import pc from 'picocolors';
import type { HostCheckResult } from '../types/doctor.types.js';

const logger = consola.withTag('lab-atlas');

/**
 * Prints a success line with consistent styling.
 */
export function printSuccess(message: string): void {
  logger.success(message);
}

/**
 * Prints an informational line with consistent styling.
 */
export function printInfo(message: string): void {
  logger.info(message);
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

  console.log(
    boxen(
      [
        pc.bold('Doctor Summary'),
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
