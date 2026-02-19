import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { Listr } from 'listr2';
import type { RestoreVolumesCommandOptions, SaveVolumesCommandOptions } from '../types/cli.types.js';
import type { VolumeArchiveEntry, VolumeArchiveManifest } from '../types/docker.types.js';
import type { ProjectContext } from '../types/project.types.js';
import { printCommandHeader } from '../ui/banner.js';
import { formatTaskTitle, printSuccess } from '../ui/logger.js';
import { hasRunningComposeServices, listConfiguredDockerVolumes } from './compose-project.service.js';
import { runCommand } from '../utils/process.js';

const VOLUME_ARCHIVE_HELPER_IMAGE = 'busybox:1.36.1';
const VOLUME_MANIFEST_FILE = 'manifest.json';

/**
 * Saves the Docker volumes declared by the selected lab layers into a directory on disk.
 */
export async function runSaveVolumesCommand(
  context: ProjectContext,
  options: SaveVolumesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Save Docker Volumes',
    summary: 'Export Docker volumes for the selected Atlas Lab layers to disk',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  const outputDirectory = resolveVolumeArchiveOutputDirectory(context.workingDirectory, options.outputDir);
  let volumes: VolumeArchiveEntry[] = [];

  await new Listr(
    [
      {
        title: formatTaskTitle('stack', 'Ensure the Atlas Lab stack is stopped'),
        task: async () => {
          if (await hasRunningComposeServices(context)) {
            throw new Error('Stop the Atlas Lab stack before saving Docker volumes.');
          }
        }
      },
      {
        title: formatTaskTitle('compose', 'Resolve configured Docker volumes'),
        task: async () => {
          volumes = (await listConfiguredDockerVolumes(context, options)).map((volume) => ({
            archiveFile: `${volume.logicalName}.tar.gz`,
            dockerName: volume.dockerName,
            logicalName: volume.logicalName
          }));

          if (volumes.length === 0) {
            throw new Error('No Docker volumes were resolved for the selected lab layers.');
          }
        }
      },
      {
        title: formatTaskTitle('stack', 'Validate Docker volumes exist locally'),
        task: async () => {
          for (const volume of volumes) {
            const result = await runCommand('docker', ['volume', 'inspect', volume.dockerName], {
              allowFailure: true,
              captureOutput: true,
              cwd: context.projectRoot,
              scope: 'stack'
            });

            if (result.exitCode !== 0) {
              throw new Error(`Docker volume not found: ${volume.dockerName}`);
            }
          }
        }
      },
      {
        title: formatTaskTitle('stack', 'Archive Docker volume contents'),
        task: () =>
          new Listr(
            volumes.map((volume) => ({
              title: formatTaskTitle('stack', `Archive volume ${volume.logicalName}`),
              task: async () => {
                mkdirSync(outputDirectory, { recursive: true });
                await runCommand(
                  'docker',
                  [
                    'run',
                    '--rm',
                    '--mount',
                    `type=volume,source=${volume.dockerName},target=/source,readonly`,
                    '--mount',
                    `type=bind,source=${outputDirectory},target=/backup`,
                    VOLUME_ARCHIVE_HELPER_IMAGE,
                    'sh',
                    '-c',
                    `tar -czf /backup/${volume.archiveFile} -C /source .`
                  ],
                  {
                    cwd: context.projectRoot,
                    scope: 'stack'
                  }
                );
              }
            })),
            {
              concurrent: false,
              exitOnError: true
            }
          )
      },
      {
        title: formatTaskTitle('stack', 'Write volume archive manifest'),
        task: async () => {
          const manifest: VolumeArchiveManifest = {
            createdAt: new Date().toISOString(),
            project: context.projectRoot,
            volumes
          };

          writeFileSync(
            join(outputDirectory, VOLUME_MANIFEST_FILE),
            `${JSON.stringify(manifest, null, 2)}\n`,
            'utf8'
          );
        }
      }
    ],
    {
      concurrent: false,
      exitOnError: true
    }
  ).run();

  printSuccess(`Docker volumes saved to ${outputDirectory}`, 'stack');
}

/**
 * Restores a directory of archived Docker volumes previously exported by `save-volumes`.
 */
export async function runRestoreVolumesCommand(
  context: ProjectContext,
  options: RestoreVolumesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Restore Docker Volumes',
    summary: 'Restore Docker volumes from an archive directory on disk',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  const inputDirectory = resolveArchiveDirectoryPath(context.workingDirectory, options.inputDir);
  const manifestPath = join(inputDirectory, VOLUME_MANIFEST_FILE);
  let manifest: VolumeArchiveManifest | null = null;

  await new Listr(
    [
      {
        title: formatTaskTitle('stack', 'Ensure the Atlas Lab stack is stopped'),
        task: async () => {
          if (await hasRunningComposeServices(context)) {
            throw new Error('Stop the Atlas Lab stack before restoring Docker volumes.');
          }
        }
      },
      {
        title: formatTaskTitle('stack', 'Validate volume archive directory'),
        task: async () => {
          if (!existsSync(inputDirectory)) {
            throw new Error(`Volume archive directory not found: ${inputDirectory}`);
          }

          if (!existsSync(manifestPath)) {
            throw new Error(`Volume archive manifest not found: ${manifestPath}`);
          }

          manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as VolumeArchiveManifest;
          if (!manifest || !Array.isArray(manifest.volumes) || manifest.volumes.length === 0) {
            throw new Error(`Invalid volume archive manifest: ${manifestPath}`);
          }

          for (const volume of manifest.volumes) {
            const archivePath = join(inputDirectory, volume.archiveFile);
            if (!existsSync(archivePath)) {
              throw new Error(`Volume archive file not found: ${archivePath}`);
            }
          }
        }
      },
      {
        title: formatTaskTitle('stack', 'Restore Docker volume contents'),
        task: () =>
          new Listr(
            (manifest?.volumes ?? []).map((volume) => ({
              title: formatTaskTitle('stack', `Restore volume ${volume.logicalName}`),
              task: async () => {
                await ensureDockerVolumeExists(volume.dockerName, context.projectRoot);
                await runCommand(
                  'docker',
                  [
                    'run',
                    '--rm',
                    '--mount',
                    `type=volume,source=${volume.dockerName},target=/target`,
                    '--mount',
                    `type=bind,source=${inputDirectory},target=/backup,readonly`,
                    VOLUME_ARCHIVE_HELPER_IMAGE,
                    'sh',
                    '-c',
                    `find /target -mindepth 1 -delete && tar -xzf /backup/${volume.archiveFile} -C /target`
                  ],
                  {
                    cwd: context.projectRoot,
                    scope: 'stack'
                  }
                );
              }
            })),
            {
              concurrent: false,
              exitOnError: true
            }
          )
      }
    ],
    {
      concurrent: false,
      exitOnError: true
    }
  ).run();

  printSuccess(`Docker volumes restored from ${inputDirectory}`, 'stack');
}

/**
 * Ensures a named Docker volume exists before attempting a restore.
 */
async function ensureDockerVolumeExists(volumeName: string, projectRoot: string): Promise<void> {
  const result = await runCommand('docker', ['volume', 'inspect', volumeName], {
    allowFailure: true,
    captureOutput: true,
    cwd: projectRoot,
    scope: 'stack'
  });

  if (result.exitCode === 0) {
    return;
  }

  await runCommand('docker', ['volume', 'create', volumeName], {
    cwd: projectRoot,
    scope: 'stack'
  });
}

/**
 * Resolves the volume archive output directory, defaulting under `backups/volumes`.
 */
function resolveVolumeArchiveOutputDirectory(workingDirectory: string, explicitOutputDir?: string): string {
  const defaultPath = join(workingDirectory, 'backups', 'volumes', `atlas-lab-volumes-${createTimestamp()}`);
  return explicitOutputDir
    ? resolveArchiveDirectoryPath(workingDirectory, explicitOutputDir)
    : defaultPath;
}

/**
 * Resolves a user-provided archive directory against the project root.
 */
function resolveArchiveDirectoryPath(workingDirectory: string, directoryPath: string): string {
  return isAbsolute(directoryPath) ? directoryPath : resolve(workingDirectory, directoryPath);
}

/**
 * Produces a filesystem-safe timestamp.
 */
function createTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}
