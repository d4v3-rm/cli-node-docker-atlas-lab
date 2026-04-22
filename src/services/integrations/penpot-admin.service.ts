import { createComposeCommandArgs } from '../../lib/docker/compose.js';
import type { BootstrapEnv, ProjectContext } from '../../types/project.types.js';
import { printInfo } from '../../cli/ui/logger.js';
import { runCommand } from '../../utils/process.js';

const PENPOT_READY_ATTEMPTS = 60;
const PENPOT_READY_DELAY_MS = 2_000;

/**
 * Ensures the configured Penpot root profile exists and matches the lab password.
 */
export async function ensurePenpotAdmin(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'created' | 'updated'> {
  const penpotEmail = env.PENPOT_ROOT_EMAIL.trim().toLowerCase();
  const baseArgs = createComposeCommandArgs(context, [
    'exec',
    '-T',
    'penpot-backend',
    'python3',
    'manage.py'
  ]);

  await waitForPenpotCli(context, baseArgs, penpotEmail);

  const profileSearch = await runCommand('docker', [...baseArgs, 'search-profile', '--email', penpotEmail], {
    captureOutput: true,
    cwd: context.projectRoot,
    scope: 'bootstrap'
  });

  if (profileSearch.stdout.toLowerCase().includes(penpotEmail)) {
    printInfo(`Penpot root profile '${penpotEmail}' already exists. Updating password.`, 'bootstrap');
    await runCommand(
      'docker',
      [...baseArgs, 'update-profile', '--email', penpotEmail, '--password', env.PENPOT_ROOT_PASSWORD],
      {
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    return 'updated';
  }

  printInfo(`Penpot root profile '${penpotEmail}' not found. Creating it.`, 'bootstrap');
  await runCommand(
    'docker',
    [
      ...baseArgs,
      'create-profile',
      '--fullname',
      env.PENPOT_ROOT_NAME,
      '--email',
      penpotEmail,
      '--password',
      env.PENPOT_ROOT_PASSWORD
    ],
    {
      cwd: context.projectRoot,
      scope: 'bootstrap'
    }
  );

  return 'created';
}

/**
 * Waits until the Penpot PREPL-based management CLI starts answering inside the container.
 */
async function waitForPenpotCli(
  context: ProjectContext,
  baseArgs: string[],
  penpotEmail: string
): Promise<void> {
  for (let attempt = 1; attempt <= PENPOT_READY_ATTEMPTS; attempt += 1) {
    const result = await runCommand(
      'docker',
      [...baseArgs, 'search-profile', '--email', penpotEmail],
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    if (result.exitCode === 0) {
      return;
    }

    await delay(PENPOT_READY_DELAY_MS);
  }

  throw new Error('Timed out waiting for the Penpot management CLI to become ready.');
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
