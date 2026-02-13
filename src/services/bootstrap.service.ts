import { Listr } from 'listr2';
import pWaitFor from 'p-wait-for';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { BootstrapCommandOptions } from '../types/cli.types.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { ensureGiteaAdmin } from './gitea-admin.service.js';
import { ensureN8nOwner } from './n8n-owner.service.js';
import { printCommandHeader } from '../ui/banner.js';
import { formatTaskTitle, printSuccess } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';
import { parseBootstrapEnv } from './project.service.js';

/**
 * Runs the standalone bootstrap workflow.
 */
export async function runBootstrapCommand(
  context: ProjectContext,
  options: BootstrapCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Bootstrap Atlas Lab',
    summary: 'Reconcile Gitea and Ollama runtime state',
    projectRoot: context.projectRoot
  });

  await new Listr(createBootstrapTasks(context, options), {
    concurrent: false,
    exitOnError: true
  }).run();
  printSuccess('Bootstrap completed.', 'bootstrap');
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
      title: formatTaskTitle('bootstrap', 'Align Gitea root account'),
      task: async () => {
        await waitForService(context, 'gitea');
        await ensureGiteaAdmin(context, env);
      }
    });
  }

  tasks.push({
    title: formatTaskTitle('bootstrap', 'Align n8n owner account'),
    task: async () => {
      await waitForService(context, 'n8n');
      await waitForService(context, 'gateway');
      await ensureN8nOwner(context, env);
    }
  });

  if (!options.skipOllama) {
    tasks.push({
      title: formatTaskTitle('bootstrap', 'Align Ollama runtime models'),
      task: async () => {
        await ensureOllamaModels(context, env);
      }
    });
  }

  return tasks;
}
/**
 * Waits for Ollama and ensures the configured runtime models are present locally.
 */
async function ensureOllamaModels(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<'present' | 'pulled'> {
  await waitForService(context, 'ollama');

  let pulledModel = false;

  for (const modelName of collectRequiredOllamaModels(env)) {
    const modelCheck = await runCommand(
      'docker',
      createComposeCommandArgs(context, [
        'exec',
        '-T',
        'ollama',
        'ollama',
        'show',
        modelName
      ]),
      {
        cwd: context.projectRoot,
        captureOutput: true,
        allowFailure: true,
        scope: 'bootstrap'
      }
    );

    if (modelCheck.exitCode === 0) {
      continue;
    }

    await runCommand(
      'docker',
      createComposeCommandArgs(context, [
        'exec',
        '-T',
        'ollama',
        'ollama',
        'pull',
        modelName
      ]),
      {
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    pulledModel = true;
  }

  return pulledModel ? 'pulled' : 'present';
}

/**
 * Collects the distinct Ollama models required by the lab bootstrap.
 */
function collectRequiredOllamaModels(env: BootstrapEnv): string[] {
  return [...new Set([env.OLLAMA_EMBEDDING_MODEL, env.OLLAMA_CHAT_MODEL])];
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
          captureOutput: true,
          scope: 'bootstrap'
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
          captureOutput: true,
          scope: 'bootstrap'
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
