import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { Listr } from 'listr2';
import type { RestoreImagesCommandOptions, SaveImagesCommandOptions } from '../types/cli.types.js';
import type { ImageArchiveManifest } from '../types/docker.types.js';
import type { ProjectContext } from '../types/project.types.js';
import { printCommandHeader } from '../ui/banner.js';
import { formatTaskTitle, printSuccess } from '../ui/logger.js';
import { listConfiguredComposeImages } from './compose-project.service.js';
import { runCommand } from '../utils/process.js';

/**
 * Saves the Docker images declared by the selected lab layers into a tar archive on disk.
 */
export async function runSaveImagesCommand(
  context: ProjectContext,
  options: SaveImagesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Save Docker Images',
    summary: 'Export Docker images for the selected Atlas Lab layers',
    projectRoot: context.projectRoot
  });

  const outputPath = resolveImageArchiveOutputPath(context.projectRoot, options.output);
  const manifestPath = `${outputPath}.manifest.json`;
  let images: string[] = [];

  await new Listr(
    [
      {
        title: formatTaskTitle('compose', 'Resolve configured image references'),
        task: async () => {
          images = await listConfiguredComposeImages(context, options);

          if (images.length === 0) {
            throw new Error('No Docker images were resolved for the selected lab layers.');
          }
        }
      },
      {
        title: formatTaskTitle('stack', 'Export Docker images archive'),
        task: async () => {
          mkdirSync(dirname(outputPath), { recursive: true });
          await runCommand('docker', ['image', 'save', '--output', outputPath, ...images], {
            cwd: context.projectRoot,
            scope: 'stack'
          });
        }
      },
      {
        title: formatTaskTitle('stack', 'Write image archive manifest'),
        task: async () => {
          const manifest: ImageArchiveManifest = {
            createdAt: new Date().toISOString(),
            images,
            project: context.projectRoot
          };

          writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
        }
      }
    ],
    {
      concurrent: false,
      exitOnError: true
    }
  ).run();

  printSuccess(`Docker images saved to ${outputPath}`, 'stack');
}

/**
 * Restores a Docker image archive previously exported by `save-images`.
 */
export async function runRestoreImagesCommand(
  context: ProjectContext,
  options: RestoreImagesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Restore Docker Images',
    summary: 'Load a Docker image archive from disk into the local daemon',
    projectRoot: context.projectRoot
  });

  const inputPath = resolveArchiveInputPath(context.projectRoot, options.input);
  const manifestPath = `${inputPath}.manifest.json`;

  await new Listr(
    [
      {
        title: formatTaskTitle('stack', 'Validate image archive path'),
        task: async () => {
          if (!existsSync(inputPath)) {
            throw new Error(`Image archive not found: ${inputPath}`);
          }
        }
      },
      {
        title: formatTaskTitle('stack', 'Load Docker image archive'),
        task: async () => {
          await runCommand('docker', ['image', 'load', '--input', inputPath], {
            cwd: context.projectRoot,
            scope: 'stack'
          });
        }
      },
      {
        title: formatTaskTitle('stack', 'Validate image archive manifest'),
        enabled: () => existsSync(manifestPath),
        task: async () => {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ImageArchiveManifest;
          if (!Array.isArray(manifest.images) || manifest.images.length === 0) {
            throw new Error(`Invalid image archive manifest: ${manifestPath}`);
          }
        }
      }
    ],
    {
      concurrent: false,
      exitOnError: true
    }
  ).run();

  printSuccess(`Docker images restored from ${inputPath}`, 'stack');
}

/**
 * Resolves the image archive output file, defaulting under `backups/images`.
 */
function resolveImageArchiveOutputPath(projectRoot: string, explicitOutput?: string): string {
  const defaultPath = join(projectRoot, 'backups', 'images', `atlas-lab-images-${createTimestamp()}.tar`);
  const outputPath = explicitOutput
    ? (isAbsolute(explicitOutput) ? explicitOutput : resolve(projectRoot, explicitOutput))
    : defaultPath;

  return outputPath.endsWith('.tar') ? outputPath : `${outputPath}.tar`;
}

/**
 * Resolves a user-provided archive input path against the project root.
 */
function resolveArchiveInputPath(projectRoot: string, inputPath: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(projectRoot, inputPath);
}

/**
 * Produces a filesystem-safe timestamp.
 */
function createTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}
