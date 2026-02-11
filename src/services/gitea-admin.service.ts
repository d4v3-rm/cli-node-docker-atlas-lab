import { createComposeCommandArgs } from '../lib/compose.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { runCommand } from '../utils/process.js';

const GITEA_CONFIG = '/data/gitea/conf/app.ini';

/**
 * Waits for Gitea and ensures the configured root user exists with the right password.
 */
export async function ensureGiteaAdmin(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'created' | 'updated'> {
  const baseArgs = createComposeCommandArgs(context, [
    'exec',
    '-T',
    '--user',
    `${env.GITEA_UID}:${env.GITEA_GID}`,
    'gitea',
    'gitea',
    'admin',
    'user'
  ]);

  const listing = await runCommand('docker', [...baseArgs, 'list', '--config', GITEA_CONFIG], {
    captureOutput: true,
    cwd: context.projectRoot,
    scope: 'bootstrap'
  });

  if (parseGiteaUsernames(listing.stdout).includes(env.GITEA_ROOT_USERNAME)) {
    await runCommand(
      'docker',
      [
        ...baseArgs,
        'change-password',
        '--config',
        GITEA_CONFIG,
        '--username',
        env.GITEA_ROOT_USERNAME,
        '--password',
        env.GITEA_ROOT_PASSWORD
      ],
      {
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    return 'updated';
  }

  await runCommand(
    'docker',
    [
      ...baseArgs,
      'create',
      '--config',
      GITEA_CONFIG,
      '--username',
      env.GITEA_ROOT_USERNAME,
      '--password',
      env.GITEA_ROOT_PASSWORD,
      '--email',
      env.GITEA_ROOT_EMAIL,
      '--admin',
      '--must-change-password=false'
    ],
    {
      cwd: context.projectRoot,
      scope: 'bootstrap'
    }
  );

  return 'created';
}

/**
 * Parses the `gitea admin user list` table into exact usernames.
 */
export function parseGiteaUsernames(stdout: string): string[] {
  return stdout
    .split(/\r?\n/gu)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(1)
    .map((line) => line.split(/\s+/gu)[1] ?? '')
    .filter((username) => username.length > 0);
}
