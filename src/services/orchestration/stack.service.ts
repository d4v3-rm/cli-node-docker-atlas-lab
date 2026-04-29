import { Listr } from 'listr2';
import { createComposeCommandArgs } from '../../lib/compose.js';
import type { GlobalCliOptions, UpCommandOptions } from '../../types/cli.types.js';
import type { ProjectContext } from '../../types/project.types.js';
import { assertPublishedPortsAvailable } from '../diagnostics/host-preflight.service.js';
import { hasRunningComposeServices } from './compose-project.service.js';
import { assertNvidiaGpuRuntime } from '../diagnostics/gpu-preflight.service.js';
import { printCommandHeader } from '../../cli/ui/banner.js';
import { formatTaskTitle, printInfo, printSuccess } from '../../cli/ui/logger.js';
import { runCommand } from '../../utils/process.js';
import { createBootstrapTasks } from './bootstrap.service.js';
import { ensureStartupImagesAvailable } from './docker-image-prefetch.service.js';

const VERBOSE_TASK_RENDERER = 'verbose' as const;

/**
 * Runs `docker compose up` and the post-start bootstrap workflow.
 */
export async function runUpCommand(
  context: ProjectContext,
  options: UpCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Start Atlas Lab Stack',
    summary: 'Bring Docker Compose up and reconcile runtime state',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });
  printInfo(`Enabled layers: ${describeEnabledLayers(options)}`, 'stack');

  const stackWasRunning = await hasRunningComposeServices(context);
  let composeStartedInThisRun = false;
  const tasks = new Listr(
    [
      ...(options.withAiLlm
        ? [
            {
              title: formatTaskTitle('host', 'Validate NVIDIA GPU runtime'),
              task: async () => {
                await assertNvidiaGpuRuntime();
              }
            }
          ]
        : []),
      {
        title: formatTaskTitle('host', 'Validate published host ports'),
        task: async () => {
          await assertPublishedPortsAvailable(context, {
            includeAiLlm: Boolean(options.withAiLlm),
            includeWorkbench: Boolean(options.withWorkbench)
          });
        }
      },
      {
        title: formatTaskTitle('stack', 'Prepare required Docker images'),
        task: async () => {
          await ensureStartupImagesAvailable(context, options);
        }
      },
      {
        title: formatTaskTitle('stack', 'Start Docker Compose stack'),
        task: async () => {
          printInfo('Starting Docker Compose services in detached mode.', 'stack');
          await runCommand('docker', createComposeUpArgs(context, options), {
            cwd: context.projectRoot,
            scope: 'compose'
          });
          printInfo('Docker Compose startup completed. Continuing with runtime bootstrap.', 'stack');
          composeStartedInThisRun = true;
        }
      },
      {
        title: formatTaskTitle('stack', 'Run bootstrap workflow'),
        task: () =>
          new Listr(
            createBootstrapTasks(context, {
              skipOllama: Boolean(options.skipOllama) || !options.withAiLlm,
              withAiLlm: Boolean(options.withAiLlm)
            }),
            {
              concurrent: false,
              exitOnError: true,
              renderer: VERBOSE_TASK_RENDERER
            }
          )
      }
    ],
    {
      concurrent: false,
      exitOnError: true,
      renderer: VERBOSE_TASK_RENDERER
    }
  );

  try {
    await tasks.run();
  } catch (error) {
    await rollbackPartialStartup(context, stackWasRunning, composeStartedInThisRun);
    throw error;
  }

  printSuccess('Atlas Lab stack is ready.', 'stack');
}

/**
 * Formats the selected Compose layers for the startup log header.
 */
function describeEnabledLayers(
  options: Pick<UpCommandOptions, 'withAiLlm' | 'withWorkbench'>
): string {
  const layers = ['core'];

  if (options.withAiLlm) {
    layers.push('ai-llm');
  }

  if (options.withWorkbench) {
    layers.push('workbench');
  }

  return layers.join(', ');
}

/**
 * Shows the current Compose status for the repository checkout.
 */
export async function runStatusCommand(
  context: ProjectContext,
  _options: GlobalCliOptions
): Promise<void> {
  printCommandHeader({
    title: 'Atlas Lab Status',
    summary: 'Display Docker Compose services for this lab install',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  await runCommand('docker', createComposeCommandArgs(context, ['ps', '--all'], { includeAll: true }), {
    cwd: context.projectRoot,
    scope: 'compose'
  });
}

/**
 * Stops the lab stack and removes Compose orphans.
 */
export async function runDownCommand(
  context: ProjectContext,
  _options: GlobalCliOptions
): Promise<void> {
  printCommandHeader({
    title: 'Stop Atlas Lab Stack',
    summary: 'Stop Docker Compose services and remove orphans',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  printInfo('Stopping the Atlas Lab stack...', 'stack');
  await runCommand(
    'docker',
    createComposeCommandArgs(context, ['down', '--remove-orphans'], { includeAll: true }),
    {
      cwd: context.projectRoot,
      scope: 'compose'
    }
  );
  printSuccess('Atlas Lab stack stopped.', 'stack');
}

/**
 * Builds the Docker Compose invocation for the `up` command.
 */
function createComposeUpArgs(context: ProjectContext, options: UpCommandOptions): string[] {
  const composeArgs = ['up', '-d', '--remove-orphans'];

  if (options.build) {
    composeArgs.push('--build');
  }

  return createComposeCommandArgs(context, composeArgs, {
    includeAiLlm: Boolean(options.withAiLlm),
    includeWorkbench: Boolean(options.withWorkbench)
  });
}

/**
 * Stops a newly started stack after a later bootstrap failure so `up` does not leave stray runtime state behind.
 */
async function rollbackPartialStartup(
  context: ProjectContext,
  stackWasRunning: boolean,
  composeStartedInThisRun: boolean
): Promise<void> {
  if (stackWasRunning || !composeStartedInThisRun) {
    return;
  }

  printInfo('Bootstrap failed after startup; stopping the partially started Atlas Lab stack.', 'stack');
  await runCommand(
    'docker',
    createComposeCommandArgs(context, ['down', '--remove-orphans'], { includeAll: true }),
    {
      allowFailure: true,
      cwd: context.projectRoot,
      scope: 'compose'
    }
  );
}
