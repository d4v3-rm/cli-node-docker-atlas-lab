import { Listr } from 'listr2';
import pWaitFor from 'p-wait-for';
import { createComposeCommandArgs, type ComposeLayerSelection } from '../../lib/docker/compose.js';
import type { BootstrapCommandOptions } from '../../types/cli.types.js';
import type { AiLlmBootstrapEnv, ProjectContext } from '../../types/project.types.js';
import { ensureBookStackAdmin } from '../integrations/bookstack-admin.service.js';
import { ensureGiteaAdmin } from '../integrations/gitea-admin.service.js';
import { ensureN8nOwner } from '../integrations/n8n-owner.service.js';
import { ensurePenpotAdmin } from '../integrations/penpot-admin.service.js';
import { ensurePlaneAdmin, waitForPlaneBootstrapPrerequisites } from '../integrations/plane-admin.service.js';
import { printCommandHeader } from '../../cli/ui/banner.js';
import { formatTaskTitle, printInfo, printSuccess } from '../../cli/ui/logger.js';
import { runCommand } from '../../utils/process.js';
import { parseAiLlmBootstrapEnv, parseBootstrapEnv } from '../runtime/project.service.js';
import { collectConfiguredOllamaModels } from '../../utils/model-lists.js';

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
    summary: 'Reconcile core runtime state plus optional AI LLM bootstrap',
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
    title: formatTaskTitle('bootstrap', 'Align BookStack initial admin'),
    task: async () => {
      await waitForService(context, 'bookstack');
      const result = await ensureBookStackAdmin(context, env);

      if (result === 'configured') {
        printInfo('BookStack initial admin configured.', 'bootstrap');
        return;
      }

      printInfo(
        'BookStack already has a non-default admin profile; leaving the existing account in place.',
        'bootstrap'
      );
    }
  });

  tasks.push({
    title: formatTaskTitle('bootstrap', 'Align Plane instance admin'),
    task: async () => {
      await waitForService(context, 'plane-api');
      await waitForPlaneBootstrapPrerequisites(context);
      const result = await ensurePlaneAdmin(context, env);
      printInfo(`Plane instance admin ${result}.`, 'bootstrap');
    }
  });

  tasks.push({
    title: formatTaskTitle('bootstrap', 'Align Penpot root profile'),
    task: async () => {
      await waitForService(context, 'penpot-backend');
      const result = await ensurePenpotAdmin(context, env);
      printInfo(`Penpot root profile ${result}.`, 'bootstrap');
    }
  });

  if (options.withAiLlm && aiLlmEnv) {
    tasks.push({
      title: formatTaskTitle('bootstrap', 'Align n8n owner account'),
      task: async () => {
        await waitForService(context, 'n8n', 180, { includeAiLlm: true });
        await waitForService(context, 'gateway-ai-llm', 180, { includeAiLlm: true });
        const result = await ensureN8nOwner(context, aiLlmEnv);
        printInfo(`n8n owner account ${result}.`, 'bootstrap');
      }
    });
  }

  if (options.withAiLlm && !options.skipOllama && aiLlmEnv) {
    tasks.push({
      title: formatTaskTitle('bootstrap', 'Align Ollama runtime models'),
      task: async () => {
        const result = await ensureOllamaModels(context, aiLlmEnv);
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
  context: ProjectContext,
  env: AiLlmBootstrapEnv
): Promise<'present' | 'pulled'> {
  await waitForService(context, 'ollama', 180, { includeAiLlm: true });

  const configuredModels = collectConfiguredOllamaModels(env);
  const missingModels = await listMissingOllamaModels(context, configuredModels);

  if (missingModels.length === 0) {
    printInfo('All configured Ollama models are already available locally.', 'bootstrap');
    return 'present';
  }

  printInfo(
    `Syncing ${missingModels.length} missing Ollama model${missingModels.length === 1 ? '' : 's'}: ${missingModels.join(', ')}`,
    'bootstrap'
  );
  printInfo('Large Ollama models can take a long time to download; progress will stream below.', 'bootstrap');

  await runCommand(
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
      scope: 'bootstrap'
    }
  );

  return 'pulled';
}

/**
 * Lists the configured Ollama models that are still missing locally inside the container.
 */
async function listMissingOllamaModels(
  context: ProjectContext,
  configuredModels: string[]
): Promise<string[]> {
  const missingModels: string[] = [];

  for (const modelName of configuredModels) {
    const inspectResult = await runCommand(
      'docker',
      createComposeCommandArgs(context, ['exec', '-T', 'ollama', 'ollama', 'show', modelName], {
        includeAiLlm: true
      }),
      {
        allowFailure: true,
        captureOutput: true,
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    if (inspectResult.exitCode !== 0) {
      missingModels.push(modelName);
    }
  }

  return missingModels;
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
