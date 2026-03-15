import { Listr } from 'listr2';
import pWaitFor from 'p-wait-for';
import { createComposeCommandArgs, type ComposeLayerSelection } from '../lib/compose.js';
import type { BootstrapCommandOptions } from '../types/cli.types.js';
import type { BootstrapEnv, ProjectContext } from '../types/project.types.js';
import { ensureGiteaAdmin } from './gitea-admin.service.js';
import { ensureN8nOwner } from './n8n-owner.service.js';
import { printCommandHeader } from '../ui/banner.js';
import { formatTaskTitle, printInfo, printSuccess } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';
import { parseAiLlmBootstrapEnv, parseBootstrapEnv } from './project.service.js';

const VERBOSE_TASK_RENDERER = 'verbose' as const;

/**
 * Runs the standalone bootstrap workflow.
 */
export async function runBootstrapCommand(
  context: ProjectContext,
  options: BootstrapCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Bootstrap Atlas Lab',
    summary: 'Reconcile core runtime state and optional AI LLM models',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  await new Listr(createBootstrapTasks(context, options), {
    concurrent: false,
    exitOnError: true,
    renderer: VERBOSE_TASK_RENDERER
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
  const aiLlmEnv = options.withAiLlm ? parseAiLlmBootstrapEnv(context.env) : undefined;

  const tasks = [];

  if (!options.skipGitea) {
    tasks.push({
      title: formatTaskTitle('bootstrap', 'Align Gitea root account'),
      task: async () => {
        await waitForService(context, 'gitea');
        const result = await ensureGiteaAdmin(context, env);
        printInfo(`Gitea root account ${result}.`, 'bootstrap');
      }
    });
  }

  tasks.push({
    title: formatTaskTitle('bootstrap', 'Align n8n owner account'),
    task: async () => {
      await waitForService(context, 'n8n');
      await waitForService(context, 'gateway');
      const result = await ensureN8nOwner(context, env);
      printInfo(`n8n owner account ${result}.`, 'bootstrap');
    }
  });

  if (options.withAiLlm && !options.skipOllama && aiLlmEnv) {
    tasks.push({
      title: formatTaskTitle('bootstrap', 'Align Ollama runtime models'),
      task: async () => {
        const result = await ensureOllamaModels(context);
        printInfo(`Ollama runtime models ${result}.`, 'bootstrap');
      }
    });
  }

  return tasks;
}
/**
 * Waits for Ollama and ensures the configured runtime models are present locally.
 */
async function ensureOllamaModels(
  context: ProjectContext
): Promise<'present' | 'pulled'> {
  await waitForService(context, 'ollama', 180, { includeAiLlm: true });

  const syncResult = await runCommand(
    'docker',
    createComposeCommandArgs(context, [
      'exec',
      '-T',
      'ollama',
      'sh',
      '/opt/atlas-lab/model-sync/sync-ollama-models.sh'
    ], { includeAiLlm: true }),
    {
      cwd: context.projectRoot,
      captureOutput: true,
      scope: 'bootstrap'
    }
  );

  const lines = syncResult.stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    if (!line.startsWith('ATLAS_OLLAMA_MODEL_SYNC_RESULT=')) {
      printInfo(line, 'bootstrap');
    }
  }

  const resultLine = lines.find((line) => line.startsWith('ATLAS_OLLAMA_MODEL_SYNC_RESULT='));
  return resultLine?.endsWith('pulled') ? 'pulled' : 'present';
}

/**
 * Polls Docker until the service reaches either `healthy` or `running`.
 */
export async function waitForService(
  context: ProjectContext,
  serviceName: string,
  timeoutSeconds = 180,
  selection: ComposeLayerSelection = {}
): Promise<void> {
  let lastReportedState = '';

  await pWaitFor(
    async () => {
      const containerId = await runCommand(
        'docker',
        createComposeCommandArgs(context, ['ps', '-q', serviceName], selection),
        {
          cwd: context.projectRoot,
          captureOutput: true,
          scope: 'bootstrap'
        }
      );

      if (!containerId.stdout.trim()) {
        reportServiceWaitState(serviceName, 'container not created yet', lastReportedState);
        lastReportedState = 'container not created yet';
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

      const normalizedState = normalizeServiceRuntimeState(state.stdout);
      reportServiceWaitState(serviceName, normalizedState, lastReportedState);
      lastReportedState = normalizedState;

      return ['healthy', 'running'].includes(normalizedState);
    },
    {
      interval: 2_000,
      timeout: {
        milliseconds: timeoutSeconds * 1000,
        message: new Error(`Timed out waiting for service '${serviceName}' to become healthy`)
      }
    }
  );

  printSuccess(`Service '${serviceName}' is ready (${lastReportedState || 'healthy'}).`, 'bootstrap');
}

/**
 * Emits a progress line only when the observed service state changes.
 */
function reportServiceWaitState(serviceName: string, nextState: string, previousState: string): void {
  if (nextState === previousState) {
    return;
  }

  printInfo(`Waiting for service '${serviceName}': ${nextState}.`, 'bootstrap');
}

/**
 * Normalizes the runtime state returned by `docker inspect`.
 */
function normalizeServiceRuntimeState(rawState: string): string {
  const normalizedState = rawState.trim();
  return normalizedState.length > 0 ? normalizedState : 'unknown';
}
