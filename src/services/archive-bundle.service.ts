import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import type { LogScope } from '../types/logging.types.js';
import { printInfo } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';

export const ARCHIVE_BUNDLE_HELPER_IMAGE = 'busybox:1.36.1';

/**
 * Creates a temporary workspace used to assemble or extract a bundle archive.
 */
export function createArchiveWorkspace(prefix: string): string {
  return mkdtempSync(join(tmpdir(), `atlas-lab-${prefix}-`));
}

/**
 * Removes a temporary workspace without failing if it has already gone away.
 */
export function cleanupArchiveWorkspace(workspacePath: string): void {
  rmSync(workspacePath, { force: true, recursive: true });
}

/**
 * Makes sure the helper image used for tar packaging is locally available.
 */
export async function ensureArchiveHelperImage(projectRoot: string, scope: LogScope): Promise<void> {
  const inspectResult = await runCommand('docker', ['image', 'inspect', ARCHIVE_BUNDLE_HELPER_IMAGE], {
    allowFailure: true,
    captureOutput: true,
    cwd: projectRoot,
    scope
  });

  if (inspectResult.exitCode === 0) {
    printInfo(`Archive helper image is available: ${ARCHIVE_BUNDLE_HELPER_IMAGE}`, scope);
    return;
  }

  printInfo(`Pulling archive helper image ${ARCHIVE_BUNDLE_HELPER_IMAGE}...`, scope);
  await runCommand('docker', ['pull', ARCHIVE_BUNDLE_HELPER_IMAGE], {
    cwd: projectRoot,
    scope
  });
}

/**
 * Packs a directory into a single gzip-compressed tar bundle.
 */
export async function packDirectoryToArchiveBundle(
  sourceDirectory: string,
  outputArchivePath: string,
  projectRoot: string,
  scope: LogScope
): Promise<void> {
  const normalizedSourceDirectory = resolve(sourceDirectory);
  const normalizedOutputArchivePath = resolve(outputArchivePath);
  const outputDirectory = dirname(normalizedOutputArchivePath);
  const outputFileName = basename(normalizedOutputArchivePath);

  mkdirSync(outputDirectory, { recursive: true });

  printInfo(`Packing archive bundle ${normalizedOutputArchivePath}`, scope);

  await runCommand(
    'docker',
    [
      'run',
      '--rm',
      '--mount',
      `type=bind,source=${normalizedSourceDirectory},target=/source,readonly`,
      '--mount',
      `type=bind,source=${outputDirectory},target=/output`,
      ARCHIVE_BUNDLE_HELPER_IMAGE,
      'sh',
      '-c',
      `tar -czf /output/${quotePosixShellArgument(outputFileName)} -C /source .`
    ],
    {
      cwd: projectRoot,
      scope
    }
  );
}

/**
 * Extracts a gzip-compressed tar bundle into a directory.
 */
export async function extractArchiveBundleToDirectory(
  inputArchivePath: string,
  outputDirectory: string,
  projectRoot: string,
  scope: LogScope
): Promise<void> {
  const normalizedInputArchivePath = resolve(inputArchivePath);
  const normalizedOutputDirectory = resolve(outputDirectory);
  const inputDirectory = dirname(normalizedInputArchivePath);
  const inputFileName = basename(normalizedInputArchivePath);

  if (!existsSync(normalizedOutputDirectory)) {
    mkdirSync(normalizedOutputDirectory, { recursive: true });
  }

  printInfo(`Extracting archive bundle ${normalizedInputArchivePath}`, scope);

  await runCommand(
    'docker',
    [
      'run',
      '--rm',
      '--mount',
      `type=bind,source=${inputDirectory},target=/input,readonly`,
      '--mount',
      `type=bind,source=${normalizedOutputDirectory},target=/output`,
      ARCHIVE_BUNDLE_HELPER_IMAGE,
      'sh',
      '-c',
      `tar -xzf /input/${quotePosixShellArgument(inputFileName)} -C /output`
    ],
    {
      cwd: projectRoot,
      scope
    }
  );
}

/**
 * Appends the canonical bundle extension without duplicating `.tar`.
 */
export function normalizeArchiveBundleOutputPath(filePath: string): string {
  const normalizedPath = filePath.toLowerCase();

  if (normalizedPath.endsWith('.tar.gz') || normalizedPath.endsWith('.tgz')) {
    return filePath;
  }

  if (normalizedPath.endsWith('.tar')) {
    return `${filePath}.gz`;
  }

  return `${filePath}.tar.gz`;
}

/**
 * Escapes a single shell argument for the POSIX shell used inside BusyBox.
 */
function quotePosixShellArgument(value: string): string {
  return `'${value.replace(/'/gu, `'\"'\"'`)}'`;
}
