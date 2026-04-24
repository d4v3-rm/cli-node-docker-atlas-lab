import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import type { RestoreImagesCommandOptions, SaveImagesCommandOptions } from '../../types/cli.types.js';
import type { ImageArchiveManifest } from '../../types/docker.types.js';
import type { ProjectContext } from '../../types/project.types.js';
import { printCommandHeader } from '../../cli/ui/banner.js';
import { printInfo, printSuccess, printWarning } from '../../cli/ui/logger.js';
import { listConfiguredComposeImages } from '../orchestration/compose-project.service.js';
import {
  cleanupArchiveWorkspace,
  createArchiveWorkspace,
  ensureArchiveHelperImage,
  extractArchiveBundleToDirectory,
  normalizeArchiveBundleOutputPath,
  packDirectoryToArchiveBundle
} from './archive-bundle.service.js';
import { runCommand } from '../../utils/process.js';

const IMAGE_ARCHIVE_MANIFEST_FILE = 'manifest.json';
const IMAGE_ARCHIVE_PAYLOAD_FILE = 'images.tar';

/**
 * Saves the Docker images declared by the selected lab layers into a single bundle archive on disk.
 */
export async function runSaveImagesCommand(
  context: ProjectContext,
  options: SaveImagesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Save Docker Images',
    summary: 'Export Docker images for the selected Atlas Lab layers',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  const outputPath = resolveImageArchiveOutputPath(context.workingDirectory, options.output);
  const workspacePath = createArchiveWorkspace('images');

  try {
    printInfo('Resolving configured Docker image references...', 'compose');
    const images = await listConfiguredComposeImages(context, options);

    if (images.length === 0) {
      throw new Error('No Docker images were resolved for the selected lab layers.');
    }

    printInfo(`Resolved ${images.length} Docker images for export.`, 'compose');
    for (const image of images) {
      printInfo(`Queue image ${image}`, 'compose');
    }

    const { available: availableImages, missing } = await filterAvailableDockerImages(
      context.projectRoot,
      images
    );

    for (const image of missing) {
      printWarning(`Skip missing Docker image ${image}`, 'stack');
    }

    if (availableImages.length === 0) {
      throw new Error(
        'No selected Docker images are available locally. Start or build the requested lab layers before saving images.'
      );
    }

    if (missing.length > 0) {
      printInfo(
        `Saving ${availableImages.length} available Docker image${availableImages.length === 1 ? '' : 's'} and skipping ${missing.length} missing image${missing.length === 1 ? '' : 's'}.`,
        'stack'
      );
    }

    await ensureArchiveHelperImage(context.projectRoot, 'stack');

    const payloadPath = join(workspacePath, IMAGE_ARCHIVE_PAYLOAD_FILE);
    printInfo(`Saving Docker images into staging payload ${payloadPath}`, 'stack');
    await runCommand('docker', ['image', 'save', '--output', payloadPath, ...availableImages], {
      cwd: context.projectRoot,
      scope: 'stack'
    });

    const manifest: ImageArchiveManifest = {
      createdAt: new Date().toISOString(),
      images: availableImages,
      project: context.projectRoot
    };

    writeFileSync(
      join(workspacePath, IMAGE_ARCHIVE_MANIFEST_FILE),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8'
    );
    printInfo(`Embedded image manifest with ${images.length} entries.`, 'stack');

    await packDirectoryToArchiveBundle(workspacePath, outputPath, context.projectRoot, 'stack');
  } finally {
    cleanupArchiveWorkspace(workspacePath);
  }

  printSuccess(`Docker images saved to ${outputPath}`, 'stack');
}

/**
 * Filters the selected Docker images down to the tags available in the local daemon.
 */
async function filterAvailableDockerImages(
  projectRoot: string,
  images: string[]
): Promise<{ available: string[]; missing: string[] }> {
  const existingImages = new Set<string>();

  for (const image of images) {
    printInfo(`Inspect image ${image}`, 'stack');

    const result = await runCommand('docker', ['image', 'inspect', image], {
      allowFailure: true,
      captureOutput: true,
      cwd: projectRoot,
      scope: 'stack'
    });

    if (result.exitCode === 0) {
      existingImages.add(image);
    }
  }

  return selectAvailableDockerImages(images, existingImages);
}

/**
 * Partitions image references while preserving the Compose resolution order.
 */
export function selectAvailableDockerImages(
  images: string[],
  existingImages: ReadonlySet<string>
): { available: string[]; missing: string[] } {
  return {
    available: images.filter((image) => existingImages.has(image)),
    missing: images.filter((image) => !existingImages.has(image))
  };
}

/**
 * Restores a Docker image archive previously exported by `save-images`.
 * Also supports the legacy raw `docker image save` tar format.
 */
export async function runRestoreImagesCommand(
  context: ProjectContext,
  options: RestoreImagesCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Restore Docker Images',
    summary: 'Load a Docker image archive from disk into the local daemon',
    projectRoot: context.projectRoot,
    workingDirectory: context.workingDirectory
  });

  const inputPath = resolveArchiveInputPath(context.workingDirectory, options.input);
  const legacyManifestPath = `${inputPath}.manifest.json`;

  if (!existsSync(inputPath)) {
    throw new Error(`Image archive not found: ${inputPath}`);
  }

  if (isLegacyImageArchive(inputPath)) {
    printInfo(`Detected legacy Docker image archive ${inputPath}`, 'stack');

    if (existsSync(legacyManifestPath)) {
      const manifest = parseImageArchiveManifest(legacyManifestPath, readFileSync(legacyManifestPath, 'utf8'));
      printInfo(`Validated legacy image manifest with ${manifest.images.length} entries.`, 'stack');
    }

    printInfo(`Loading Docker image archive ${inputPath}`, 'stack');
    await runCommand('docker', ['image', 'load', '--input', inputPath], {
      cwd: context.projectRoot,
      scope: 'stack'
    });

    printSuccess(`Docker images restored from ${inputPath}`, 'stack');
    return;
  }

  await ensureArchiveHelperImage(context.projectRoot, 'stack');

  const workspacePath = createArchiveWorkspace('images-restore');

  try {
    await extractArchiveBundleToDirectory(inputPath, workspacePath, context.projectRoot, 'stack');

    const manifestPath = join(workspacePath, IMAGE_ARCHIVE_MANIFEST_FILE);
    if (!existsSync(manifestPath)) {
      throw new Error(`Image archive manifest not found inside bundle: ${manifestPath}`);
    }

    const manifest = parseImageArchiveManifest(manifestPath, readFileSync(manifestPath, 'utf8'));
    printInfo(`Validated bundled image manifest with ${manifest.images.length} entries.`, 'stack');
    for (const image of manifest.images) {
      printInfo(`Restore image ${image}`, 'stack');
    }

    const payloadPath = join(workspacePath, IMAGE_ARCHIVE_PAYLOAD_FILE);
    if (!existsSync(payloadPath) || !statSync(payloadPath).isFile()) {
      throw new Error(`Bundled Docker image payload not found: ${payloadPath}`);
    }

    printInfo(`Loading bundled Docker image payload ${payloadPath}`, 'stack');
    await runCommand('docker', ['image', 'load', '--input', payloadPath], {
      cwd: context.projectRoot,
      scope: 'stack'
    });
  } finally {
    cleanupArchiveWorkspace(workspacePath);
  }

  printSuccess(`Docker images restored from ${inputPath}`, 'stack');
}

/**
 * Resolves the image archive output file, defaulting under `backups/images`.
 */
function resolveImageArchiveOutputPath(workingDirectory: string, explicitOutput?: string): string {
  const defaultFileName = `atlas-lab-images-${createTimestamp()}.tar.gz`;
  const defaultPath = join(workingDirectory, 'backups', 'images', defaultFileName);

  if (!explicitOutput) {
    return defaultPath;
  }

  const outputPath = isAbsolute(explicitOutput) ? explicitOutput : resolve(workingDirectory, explicitOutput);

  if (existsSync(outputPath) && statSync(outputPath).isDirectory()) {
    return join(outputPath, defaultFileName);
  }

  return normalizeArchiveBundleOutputPath(outputPath);
}

/**
 * Resolves a user-provided archive input path against the working directory.
 */
function resolveArchiveInputPath(workingDirectory: string, inputPath: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(workingDirectory, inputPath);
}

/**
 * Recognizes the previous raw `docker image save` export format.
 */
function isLegacyImageArchive(inputPath: string): boolean {
  const normalizedPath = inputPath.toLowerCase();
  return normalizedPath.endsWith('.tar') && !normalizedPath.endsWith('.tar.gz');
}

/**
 * Validates the JSON manifest embedded in or persisted next to an image archive.
 */
function parseImageArchiveManifest(manifestPath: string, rawManifest: string): ImageArchiveManifest {
  const manifest = JSON.parse(rawManifest) as ImageArchiveManifest;

  if (!Array.isArray(manifest.images) || manifest.images.length === 0) {
    throw new Error(`Invalid image archive manifest: ${manifestPath}`);
  }

  return manifest;
}

/**
 * Produces a filesystem-safe timestamp.
 */
function createTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}
