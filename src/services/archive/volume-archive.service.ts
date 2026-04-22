import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, resolve } from 'node:path';
import type { RestoreVolumesCommandOptions, SaveVolumesCommandOptions } from '../../types/cli.types.js';
import type { VolumeArchiveEntry, VolumeArchiveManifest } from '../../types/docker.types.js';
import type { ProjectContext } from '../../types/project.types.js';
import { printCommandHeader } from '../../cli/ui/banner.js';
import { printInfo, printSuccess } from '../../cli/ui/logger.js';
import { hasRunningComposeServices, listConfiguredDockerVolumes } from '../orchestration/compose-project.service.js';
import {
  ARCHIVE_BUNDLE_HELPER_IMAGE,
  cleanupArchiveWorkspace,
  createArchiveWorkspace,
  ensureArchiveHelperImage,
  extractArchiveBundleToDirectory,
  normalizeArchiveBundleOutputPath,
  packDirectoryToArchiveBundle
} from './archive-bundle.service.js';
import { runCommand } from '../../utils/process.js';

const VOLUME_MANIFEST_FILE = 'manifest.json';

/**
 * Saves the Docker volumes declared by the selected lab layers into a single bundle archive on disk.
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

  const outputPath = resolveVolumeArchiveOutputPath(context.workingDirectory, options.output);

  printInfo('Checking that the Atlas Lab stack is stopped before volume export...', 'stack');
  if (await hasRunningComposeServices(context)) {
    throw new Error('Stop the Atlas Lab stack before saving Docker volumes.');
  }

  printInfo('Resolving configured Docker volumes...', 'compose');
  const volumes = (await listConfiguredDockerVolumes(context, options)).map((volume) => ({
    archiveFile: `${volume.logicalName}.tar`,
    dockerName: volume.dockerName,
    logicalName: volume.logicalName
  }));

  if (volumes.length === 0) {
    throw new Error('No Docker volumes were resolved for the selected lab layers.');
  }

  printInfo(`Resolved ${volumes.length} Docker volumes for export.`, 'compose');
  for (const volume of volumes) {
    printInfo(`Queue volume ${volume.logicalName} (${volume.dockerName})`, 'compose');
  }

  await ensureArchiveHelperImage(context.projectRoot, 'stack');
  await validateDockerVolumesExist(context.projectRoot, volumes);

  const workspacePath = createArchiveWorkspace('volumes');

  try {
    for (const volume of volumes) {
      printInfo(`Archiving volume ${volume.logicalName} into ${volume.archiveFile}`, 'stack');
      await runCommand(
        'docker',
        [
          'run',
          '--rm',
          '--mount',
          `type=volume,source=${volume.dockerName},target=/source,readonly`,
          '--mount',
          `type=bind,source=${workspacePath},target=/backup`,
          ARCHIVE_BUNDLE_HELPER_IMAGE,
          'sh',
          '-c',
          `tar -cf /backup/${quotePosixShellArgument(volume.archiveFile)} -C /source .`
        ],
        {
          cwd: context.projectRoot,
          scope: 'stack'
        }
      );
    }

    const manifest: VolumeArchiveManifest = {
      createdAt: new Date().toISOString(),
      project: context.projectRoot,
      volumes
    };

    writeFileSync(join(workspacePath, VOLUME_MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    printInfo(`Embedded volume manifest with ${volumes.length} entries.`, 'stack');

    await packDirectoryToArchiveBundle(workspacePath, outputPath, context.projectRoot, 'stack');
  } finally {
    cleanupArchiveWorkspace(workspacePath);
  }

  printSuccess(`Docker volumes saved to ${outputPath}`, 'stack');
}

/**
 * Restores Docker volumes from a single archive bundle on disk.
 * Also supports the legacy directory-based backup format.
 */
export async function runRestoreVolumesCommand(
  context: ProjectContext,
  options: RestoreVolumesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Restore Docker Volumes',
    summary: 'Restore Docker volumes from an archive on disk',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  const inputPath = resolveArchivePath(context.workingDirectory, options.input);

  printInfo('Checking that the Atlas Lab stack is stopped before volume restore...', 'stack');
  if (await hasRunningComposeServices(context)) {
    throw new Error('Stop the Atlas Lab stack before restoring Docker volumes.');
  }

  if (!existsSync(inputPath)) {
    throw new Error(`Volume archive not found: ${inputPath}`);
  }

  const inputStats = statSync(inputPath);

  if (inputStats.isDirectory()) {
    await restoreLegacyVolumeArchiveDirectory(context, inputPath);
    printSuccess(`Docker volumes restored from ${inputPath}`, 'stack');
    return;
  }

  await ensureArchiveHelperImage(context.projectRoot, 'stack');

  const workspacePath = createArchiveWorkspace('volumes-restore');

  try {
    await extractArchiveBundleToDirectory(inputPath, workspacePath, context.projectRoot, 'stack');
    const manifest = loadVolumeArchiveManifest(join(workspacePath, VOLUME_MANIFEST_FILE));

    printInfo(`Validated bundled volume manifest with ${manifest.volumes.length} entries.`, 'stack');
    await restoreVolumesFromDirectory(context.projectRoot, workspacePath, manifest.volumes);
  } finally {
    cleanupArchiveWorkspace(workspacePath);
  }

  printSuccess(`Docker volumes restored from ${inputPath}`, 'stack');
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
    printInfo(`Volume already exists: ${volumeName}`, 'stack');
    return;
  }

  printInfo(`Creating missing Docker volume ${volumeName}`, 'stack');
  await runCommand('docker', ['volume', 'create', volumeName], {
    cwd: projectRoot,
    scope: 'stack'
  });
}

/**
 * Validates that every Docker volume required by the export exists locally.
 */
async function validateDockerVolumesExist(projectRoot: string, volumes: VolumeArchiveEntry[]): Promise<void> {
  for (const volume of volumes) {
    printInfo(`Inspect volume ${volume.logicalName} (${volume.dockerName})`, 'stack');

    const result = await runCommand('docker', ['volume', 'inspect', volume.dockerName], {
      allowFailure: true,
      captureOutput: true,
      cwd: projectRoot,
      scope: 'stack'
    });

    if (result.exitCode !== 0) {
      throw new Error(`Docker volume not found: ${volume.dockerName}`);
    }
  }
}

/**
 * Restores volumes from the legacy directory-based backup layout.
 */
async function restoreLegacyVolumeArchiveDirectory(
  context: ProjectContext,
  inputDirectory: string
): Promise<void> {
  printInfo(`Detected legacy volume archive directory ${inputDirectory}`, 'stack');
  const manifest = loadVolumeArchiveManifest(join(inputDirectory, VOLUME_MANIFEST_FILE));
  await restoreVolumesFromDirectory(context.projectRoot, inputDirectory, manifest.volumes);
}

/**
 * Restores each archived volume from a directory that already contains the manifest and payload files.
 */
async function restoreVolumesFromDirectory(
  projectRoot: string,
  archiveDirectory: string,
  volumes: VolumeArchiveEntry[]
): Promise<void> {
  const stagingRoot = createArchiveWorkspace('volumes-stage');

  try {
    for (const volume of volumes) {
      const archivePath = join(archiveDirectory, volume.archiveFile);
      if (!existsSync(archivePath) || !statSync(archivePath).isFile()) {
        throw new Error(`Volume archive file not found: ${archivePath}`);
      }

      printInfo(`Restoring volume ${volume.logicalName} from ${basename(archivePath)}`, 'stack');
      await ensureDockerVolumeExists(volume.dockerName, projectRoot);
      const stagingDirectory = join(stagingRoot, volume.logicalName);
      mkdirSync(stagingDirectory, { recursive: true });

      printInfo(`Extracting ${volume.logicalName} into staging before replacing the target volume`, 'stack');
      await runCommand(
        'docker',
        [
          'run',
          '--rm',
          '--mount',
          `type=bind,source=${stagingDirectory},target=/staging`,
          '--mount',
          `type=bind,source=${archiveDirectory},target=/backup,readonly`,
          ARCHIVE_BUNDLE_HELPER_IMAGE,
          'sh',
          '-c',
          `find /staging -mindepth 1 -delete && tar ${resolveTarExtractFlag(volume.archiveFile)} /backup/${quotePosixShellArgument(volume.archiveFile)} -C /staging`
        ],
        {
          cwd: projectRoot,
          scope: 'stack'
        }
      );

      printInfo(`Replacing contents of Docker volume ${volume.logicalName}`, 'stack');
      await runCommand(
        'docker',
        [
          'run',
          '--rm',
          '--mount',
          `type=volume,source=${volume.dockerName},target=/target`,
          '--mount',
          `type=bind,source=${stagingDirectory},target=/staging,readonly`,
          ARCHIVE_BUNDLE_HELPER_IMAGE,
          'sh',
          '-c',
          'find /target -mindepth 1 -delete && cp -a /staging/. /target/'
        ],
        {
          cwd: projectRoot,
          scope: 'stack'
        }
      );
    }
  } finally {
    cleanupArchiveWorkspace(stagingRoot);
  }
}

/**
 * Loads and validates the volume archive manifest.
 */
function loadVolumeArchiveManifest(manifestPath: string): VolumeArchiveManifest {
  if (!existsSync(manifestPath)) {
    throw new Error(`Volume archive manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as VolumeArchiveManifest;

  if (!Array.isArray(manifest.volumes) || manifest.volumes.length === 0) {
    throw new Error(`Invalid volume archive manifest: ${manifestPath}`);
  }

  return manifest;
}

/**
 * Resolves the volume archive output file, defaulting under `backups/volumes`.
 */
function resolveVolumeArchiveOutputPath(workingDirectory: string, explicitOutput?: string): string {
  const defaultFileName = `atlas-lab-volumes-${createTimestamp()}.tar.gz`;
  const defaultPath = join(workingDirectory, 'backups', 'volumes', defaultFileName);

  if (!explicitOutput) {
    return defaultPath;
  }

  const outputPath = resolveArchivePath(workingDirectory, explicitOutput);

  if (existsSync(outputPath) && statSync(outputPath).isDirectory()) {
    return join(outputPath, defaultFileName);
  }

  return normalizeArchiveBundleOutputPath(outputPath);
}

/**
 * Resolves a user-provided archive path against the working directory.
 */
function resolveArchivePath(workingDirectory: string, archivePath: string): string {
  return isAbsolute(archivePath) ? archivePath : resolve(workingDirectory, archivePath);
}

/**
 * Chooses the correct tar extraction flag for plain tar vs gzip-compressed payloads.
 */
/**
 * Chooses the correct tar extraction flag for plain tar vs gzip-compressed payloads.
 */
function resolveTarExtractFlag(filePath: string): string {
  const normalizedPath = filePath.toLowerCase();
  return normalizedPath.endsWith('.tar.gz') || normalizedPath.endsWith('.tgz') ? '-xzf' : '-xf';
}

/**
 * Escapes a single shell argument for the POSIX shell used inside BusyBox.
 */
function quotePosixShellArgument(value: string): string {
  return `'${value.replace(/'/gu, `'\"'\"'`)}'`;
}

/**
 * Produces a filesystem-safe timestamp.
 */
function createTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}
