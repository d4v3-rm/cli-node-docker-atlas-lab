import { Listr } from 'listr2';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { GlobalCliOptions, UpCommandOptions } from '../types/cli.types.js';
import type { ProjectContext } from '../types/project.types.js';
import { assertPublishedPortsAvailable } from './host-preflight.service.js';
import { hasRunningComposeServices } from './compose-project.service.js';
import { assertNvidiaGpuRuntime } from './gpu-preflight.service.js';
import { printCommandHeader } from '../ui/banner.js';
import { formatTaskTitle, printInfo, printSuccess } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';
import { createBootstrapTasks } from './bootstrap.service.js';

const LEGACY_IMAGES = [
  'cli-node-lab-ollama-init:latest',
  'cli-node-docker-atlas-lab-ollama-init:latest'
] as const;

/**
 * Runs `docker compose up`, the bootstrap workflow, and the legacy image cleanup.
 */
export async function runUpCommand(
  context: ProjectContext,
  options: UpCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Start Atlas Lab Stack',
    summary: 'Bring Docker Compose up and reconcile runtime state',
    projectRoot: context.projectRoot
  });

  const stackWasRunning = await hasRunningComposeServices(context);
  let composeStartedInThisRun = false;
  const tasks = new Listr(
    [
      {
        title: formatTaskTitle('host', 'Validate NVIDIA GPU runtime'),
        task: async () => {
          await assertNvidiaGpuRuntime();
        }
      },
      {
        title: formatTaskTitle('host', 'Validate published host ports'),
        task: async () => {
          await assertPublishedPortsAvailable(context, {
            includeWorkbench: Boolean(options.withWorkbench)
          });
        }
      },
      {
        title: formatTaskTitle('stack', 'Start Docker Compose stack'),
        task: async () => {
          await runCommand('docker', createComposeUpArgs(context, options), {
            cwd: context.projectRoot,
            scope: 'compose'
          });
          composeStartedInThisRun = true;
        }
      },
      {
        title: formatTaskTitle('stack', 'Run bootstrap workflow'),
        task: () =>
          new Listr(
            createBootstrapTasks(context, {
              skipGitea: false,
              skipOllama: false
            }),
            {
              concurrent: false,
              exitOnError: true
            }
          )
      },
      {
        title: formatTaskTitle('stack', 'Remove legacy init images'),
        task: async () => {
          await cleanupLegacyImages(context.projectRoot);
        }
      }
    ],
    {
      concurrent: false,
      exitOnError: true
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
 * Shows the current Compose status for the repository checkout.
 */
export async function runStatusCommand(
  context: ProjectContext,
  _options: GlobalCliOptions
): Promise<void> {
  printCommandHeader({
    title: 'Atlas Lab Status',
    summary: 'Display Docker Compose services for this checkout',
    projectRoot: context.projectRoot
  });

  await runCommand('docker', createComposeCommandArgs(context, ['ps', '--all']), {
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
    projectRoot: context.projectRoot
  });

  printInfo('Stopping the Atlas Lab stack...', 'stack');
  await runCommand('docker', createComposeCommandArgs(context, ['down', '--remove-orphans']), {
    cwd: context.projectRoot,
    scope: 'compose'
  });
  printSuccess('Atlas Lab stack stopped.', 'stack');
}

/**
 * Builds the Docker Compose invocation for the `up` command.
 */
function createComposeUpArgs(context: ProjectContext, options: UpCommandOptions): string[] {
  const composeArgs = [];

  if (options.withWorkbench) {
    composeArgs.push('--profile', 'workbench');
  }

  composeArgs.push('up', '-d', '--remove-orphans');

  if (options.build) {
    composeArgs.push('--build');
  }

  return createComposeCommandArgs(context, composeArgs);
}

/**
 * Removes the old one-shot init image if it is still present locally.
 */
async function cleanupLegacyImages(projectRoot: string): Promise<number> {
  let removedImages = 0;

  for (const image of LEGACY_IMAGES) {
    const result = await runCommand('docker', ['image', 'rm', '-f', image], {
      cwd: projectRoot,
      captureOutput: true,
      allowFailure: true,
      scope: 'stack'
    });

    if (result.exitCode === 0) {
      removedImages += 1;
    }
  }

  return removedImages;
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
  await runCommand('docker', createComposeCommandArgs(context, ['down', '--remove-orphans']), {
    allowFailure: true,
    cwd: context.projectRoot,
    scope: 'compose'
  });
}
