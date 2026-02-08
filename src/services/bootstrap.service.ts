import { Listr } from 'listr2';
import pWaitFor from 'p-wait-for';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { BootstrapCommandOptions } from '../types/cli.types.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { printCommandHeader } from '../ui/banner.js';
import { printSuccess } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';
import { parseBootstrapEnv } from './project.service.js';

const GITEA_CONFIG = '/data/gitea/conf/app.ini';

/**
 * Runs the standalone bootstrap workflow.
 */
export async function runBootstrapCommand(
  context: ProjectContext,
  options: BootstrapCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Bootstrap Lab',
    summary: 'Reconcile Gitea and Ollama runtime state',
    projectRoot: context.projectRoot
  });

  await new Listr(createBootstrapTasks(context, options), {
    concurrent: false,
    exitOnError: true
  }).run();
  printSuccess('Bootstrap completed.');
}

/**
 * Creates reusable bootstrap tasks so `up` can nest them in its own workflow.
 */
export function createBootstrapTasks(
  context: ProjectContext,
  options: BootstrapCommandOptions
) {
  const env = parseBootstrapEnv(context.env);

  const tasks = [];

  if (!options.skipGitea) {
    tasks.push({
      title: 'Align Gitea root account',
      task: async () => {
        await ensureGiteaAdmin(context, env);
      }
    });
  }

  if (!options.skipOllama) {
    tasks.push({
      title: 'Align Ollama embedding model',
      task: async () => {
        await ensureOllamaModel(context, env);
      }
    });
  }

  return tasks;
}

/**
 * Waits for Gitea and ensures the configured root user exists with the right password.
 */
async function ensureGiteaAdmin(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'created' | 'updated'> {
  await waitForService(context, 'gitea');

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
    cwd: context.projectRoot,
    captureOutput: true
  });

  if (listing.stdout.includes(env.GITEA_ROOT_USERNAME)) {
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
      { cwd: context.projectRoot }
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
    { cwd: context.projectRoot }
  );

  return 'created';
}

/**
 * Waits for Ollama and ensures the embedding model is present locally.
 */
async function ensureOllamaModel(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'present' | 'pulled'> {
  await waitForService(context, 'ollama');

  const modelCheck = await runCommand(
    'docker',
    createComposeCommandArgs(context, [
      'exec',
      '-T',
      'ollama',
      'ollama',
      'show',
      env.OLLAMA_EMBEDDING_MODEL
    ]),
    {
      cwd: context.projectRoot,
      captureOutput: true,
      allowFailure: true
    }
  );

  if (modelCheck.exitCode === 0) {
    return 'present';
  }

  await runCommand(
    'docker',
    createComposeCommandArgs(context, [
      'exec',
      '-T',
      'ollama',
      'ollama',
      'pull',
      env.OLLAMA_EMBEDDING_MODEL
    ]),
    {
      cwd: context.projectRoot
    }
  );

  return 'pulled';
}

/**
 * Polls Docker until the service reaches either `healthy` or `running`.
 */
async function waitForService(
  context: ProjectContext,
  serviceName: string,
  timeoutSeconds = 180
): Promise<void> {
  await pWaitFor(
    async () => {
      const containerId = await runCommand(
        'docker',
        createComposeCommandArgs(context, ['ps', '-q', serviceName]),
        {
          cwd: context.projectRoot,
          captureOutput: true
        }
      );

      if (!containerId.stdout.trim()) {
        return false;
      }

      const state = await runCommand(
        'docker',
        [
          'inspect',
          '--format',
          '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}',
          containerId.stdout.trim()
        ],
        {
          cwd: context.projectRoot,
          captureOutput: true
        }
      );

      return ['healthy', 'running'].includes(state.stdout.trim());
    },
    {
      interval: 2_000,
      timeout: {
        milliseconds: timeoutSeconds * 1000,
        message: new Error(`Timed out waiting for service '${serviceName}' to become healthy`)
      }
    }
  );
}
