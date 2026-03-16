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
    `  ${APP_METADATA.cliName} up --with-ai-llm`,
    `  ${APP_METADATA.cliName} up --with-ai-image`,
    `  ${APP_METADATA.cliName} up --with-ai-video`,
    `  ${APP_METADATA.cliName} up --build --with-ai-llm --with-ai-image --with-ai-video --with-workbench`,
    `  ${APP_METADATA.cliName} bootstrap --with-ai-llm`,
    `  ${APP_METADATA.cliName} doctor --with-ai-llm --with-ai-image --with-ai-video --smoke`,
    `  ${APP_METADATA.cliName} save-images --with-ai-llm --with-ai-image --with-ai-video --with-workbench`,
    `  ${APP_METADATA.cliName} restore-images --input .\\backups\\images\\atlas-lab-images.tar.gz`,
    `  ${APP_METADATA.cliName} save-volumes --with-ai-llm --with-ai-image --with-ai-video --with-workbench`,
    `  ${APP_METADATA.cliName} restore-volumes --input .\\backups\\volumes\\atlas-lab-volumes.tar.gz`,
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
    lines.push(`${pc.dim('Assets')} ${options.projectRoot}`);
  }

  if (options.workingDirectory && options.workingDirectory !== options.projectRoot) {
    lines.push(`${pc.dim('Working dir')} ${options.workingDirectory}`);
  }

  console.log(
    boxen(lines.join('\n'), {
      padding: { top: 0, right: 1, bottom: 0, left: 1 },
      borderStyle: 'single',
      borderColor: 'gray'
    })
  );
}
