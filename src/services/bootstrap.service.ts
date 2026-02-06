import { Listr } from 'listr2';
import type { BootstrapCommandOptions } from '../types/cli.types.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { printCommandHeader } from '../ui/banner.js';
import { printSuccess } from '../ui/logger.js';
import { ensureEnvKeys } from './project.service.js';
import { runCommand, sleep } from '../utils/process.js';

const GITEA_CONFIG = '/data/gitea/conf/app.ini';
const BOOTSTRAP_ENV_KEYS = [
  'GITEA_UID',
  'GITEA_GID',
  'GITEA_ROOT_USERNAME',
  'GITEA_ROOT_PASSWORD',
  'GITEA_ROOT_EMAIL',
  'OLLAMA_EMBEDDING_MODEL'
] as const;

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
){
  const env = context.env;
  ensureEnvKeys(env, BOOTSTRAP_ENV_KEYS);

  const tasks = [];

  if (!options.skipGitea) {
    tasks.push({
      title: 'Align Gitea root account',
      task: async () => {
        await ensureGiteaAdmin(context.projectRoot, env);
      }
    });
  }

  if (!options.skipOllama) {
    tasks.push({
      title: 'Align Ollama embedding model',
      task: async () => {
        await ensureOllamaModel(context.projectRoot, env);
      }
    });
  }

  return tasks;
}

/**
 * Waits for Gitea and ensures the configured root user exists with the right password.
 */
async function ensureGiteaAdmin(projectRoot: string, env: BootstrapEnv): Promise<'created' | 'updated'> {
  await waitForService(projectRoot, 'gitea');

  const baseArgs = [
    'compose',
    'exec',
    '-T',
    '--user',
    `${env.GITEA_UID}:${env.GITEA_GID}`,
    'gitea',
    'gitea',
    'admin',
    'user'
  ];

  const listing = await runCommand('docker', [...baseArgs, 'list', '--config', GITEA_CONFIG], {
    cwd: projectRoot,
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
      { cwd: projectRoot }
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
    { cwd: projectRoot }
  );

  return 'created';
}

/**
 * Waits for Ollama and ensures the embedding model is present locally.
 */
async function ensureOllamaModel(projectRoot: string, env: BootstrapEnv): Promise<'present' | 'pulled'> {
  await waitForService(projectRoot, 'ollama');

  const modelCheck = await runCommand(
    'docker',
    ['compose', 'exec', '-T', 'ollama', 'ollama', 'show', env.OLLAMA_EMBEDDING_MODEL],
    {
      cwd: projectRoot,
      captureOutput: true,
      allowFailure: true
    }
  );

  if (modelCheck.exitCode === 0) {
    return 'present';
  }

  await runCommand(
    'docker',
    ['compose', 'exec', '-T', 'ollama', 'ollama', 'pull', env.OLLAMA_EMBEDDING_MODEL],
    {
      cwd: projectRoot
    }
  );

  return 'pulled';
}

/**
 * Polls Docker until the service reaches either `healthy` or `running`.
 */
async function waitForService(
  projectRoot: string,
  serviceName: string,
  timeoutSeconds = 180
): Promise<void> {
  const deadline = Date.now() + timeoutSeconds * 1000;

  while (Date.now() < deadline) {
    const containerId = await runCommand('docker', ['compose', 'ps', '-q', serviceName], {
      cwd: projectRoot,
      captureOutput: true
    });

    if (containerId.stdout.trim()) {
      const state = await runCommand(
        'docker',
        [
          'inspect',
          '--format',
          '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}',
          containerId.stdout.trim()
        ],
        {
          cwd: projectRoot,
          captureOutput: true
        }
      );

      if (['healthy', 'running'].includes(state.stdout.trim())) {
        return;
      }
    }

    await sleep(2_000);
  }

  throw new Error(`Timed out waiting for service '${serviceName}' to become healthy`);
}
