import { createComposeCommandArgs } from '../lib/compose.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { printInfo } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';

const BOOKSTACK_BOOTSTRAP_ATTEMPTS = 20;
const BOOKSTACK_BOOTSTRAP_DELAY_MS = 3_000;

/**
 * Configures the initial BookStack admin account without introducing disposable init containers.
 */
export async function ensureBookStackAdmin(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'configured' | 'skipped'> {
  const adminEmail = env.BOOKSTACK_ROOT_EMAIL.trim().toLowerCase();
  const adminName = env.BOOKSTACK_ROOT_NAME.trim();

  printInfo(`Aligning BookStack initial admin '${adminEmail}'.`, 'bootstrap');

  for (let attempt = 1; attempt <= BOOKSTACK_BOOTSTRAP_ATTEMPTS; attempt += 1) {
    const result = await runCommand(
      'docker',
      createComposeCommandArgs(context, [
        'exec',
        '-T',
        'bookstack',
        'php',
        '/app/www/artisan',
        'bookstack:create-admin',
        '--initial',
        '--email',
        adminEmail,
        '--name',
        adminName,
        '--password',
        env.BOOKSTACK_ROOT_PASSWORD
      ]),
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    if (result.exitCode === 0) {
      return 'configured';
    }

    if (result.exitCode === 2) {
      return 'skipped';
    }

    if (attempt < BOOKSTACK_BOOTSTRAP_ATTEMPTS) {
      const failureSummary = summarizeBookStackBootstrapFailure(result.stdout, result.stderr);
      printInfo(
        `BookStack bootstrap is not ready yet (${failureSummary}). Retrying in ${BOOKSTACK_BOOTSTRAP_DELAY_MS / 1000}s.`,
        'bootstrap'
      );
      await delay(BOOKSTACK_BOOTSTRAP_DELAY_MS);
      continue;
    }

    throw new Error(
      summarizeBookStackBootstrapFailure(result.stdout, result.stderr)
    );
  }

  throw new Error('BookStack bootstrap did not complete within the retry window.');
}

function summarizeBookStackBootstrapFailure(stdout: string, stderr: string): string {
  const lines = `${stdout}\n${stderr}`
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.at(-1) ?? 'unknown bootstrap error';
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
