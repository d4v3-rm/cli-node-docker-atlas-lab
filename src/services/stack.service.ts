import { Listr } from 'listr2';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { GlobalCliOptions, UpCommandOptions } from '../types/cli.types.js';
import type { ProjectContext } from '../types/project.types.js';
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

  const tasks = new Listr(
    [
      {
        title: formatTaskTitle('stack', 'Start Docker Compose stack'),
        task: async () => {
          await runCommand('docker', createComposeUpArgs(context, options), {
            cwd: context.projectRoot,
            scope: 'compose'
          });
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

  await tasks.run();
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
