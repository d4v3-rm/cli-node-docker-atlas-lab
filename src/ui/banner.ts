import boxen from 'boxen';
import pc from 'picocolors';
import { APP_METADATA } from '../config/app-metadata.js';
import type { CommandHeaderOptions } from '../types/ui.types.js';

/**
 * Renders the banner shown in the Commander help output.
 */
export function renderHelpBanner(): string {
  const body = [
    pc.bold(pc.cyan(`${APP_METADATA.displayName} CLI`)),
    pc.dim(APP_METADATA.description)
  ].join('\n');

  return boxen(body, {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  });
}

/**
 * Renders the footer appended to the Commander help output.
 */
export function renderHelpFooter(): string {
  return [
    '',
    pc.bold('Examples:'),
    `  ${APP_METADATA.cliName} up`,
    `  ${APP_METADATA.cliName} up --build --with-workbench`,
    `  ${APP_METADATA.cliName} bootstrap`,
    `  ${APP_METADATA.cliName} doctor --smoke`,
    `  ${APP_METADATA.cliName} status --project-dir C:\\path\\to\\${APP_METADATA.codeName}`
  ].join('\n');
}

/**
 * Prints a compact panel before a command starts doing work.
 */
export function printCommandHeader(options: CommandHeaderOptions): void {
  const lines = [pc.bold(pc.cyan(options.title))];

  if (options.summary) {
    lines.push(pc.dim(options.summary));
  }

  if (options.projectRoot) {
    lines.push(`${pc.dim('Project')} ${options.projectRoot}`);
  }

  console.log(
    boxen(lines.join('\n'), {
      padding: { top: 0, right: 1, bottom: 0, left: 1 },
      borderStyle: 'single',
      borderColor: 'gray'
    })
  );
}
