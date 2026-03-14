import { APP_METADATA } from '../config/app-metadata.js';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { ComposePsEntry } from '../types/docker.types.js';
import type { GlobalCliOptions, SaveImagesCommandOptions } from '../types/cli.types.js';
import type { ProjectContext } from '../types/project.types.js';
import { runCommand } from '../utils/process.js';

/**
 * Lists running Compose entries for the current project checkout.
 */
export async function listRunningComposeEntries(
  context: ProjectContext
): Promise<ComposePsEntry[]> {
  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, ['ps', '--status', 'running', '--format', 'json'], {
      includeAll: true
    }),
    {
      allowFailure: true,
      captureOutput: true,
      cwd: context.projectRoot,
      scope: 'compose'
    }
  );

  if (result.exitCode !== 0) {
    return [];
  }

  return parseComposePsEntries(result.stdout);
}

/**
 * Returns whether the current Compose project already has running services.
 */
export async function hasRunningComposeServices(context: ProjectContext): Promise<boolean> {
  const entries = await listRunningComposeEntries(context);
  return entries.length > 0;
}

/**
 * Collects all published host ports currently owned by the running Compose project.
 */
export async function getRunningComposePublishedPorts(
  context: ProjectContext
): Promise<Set<number>> {
  const entries = await listRunningComposeEntries(context);
  return collectPublishedPorts(entries);
}

/**
 * Lists the Docker images declared by the selected Compose layers.
 */
export async function listConfiguredComposeImages(
  context: ProjectContext,
  options: Pick<SaveImagesCommandOptions, 'withAiLlm' | 'withAiImage' | 'withWorkbench'>
): Promise<string[]> {
  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, ['config', '--images'], {
      includeAiLlm: Boolean(options.withAiLlm),
      includeAiImage: Boolean(options.withAiImage),
      includeWorkbench: Boolean(options.withWorkbench)
    }),
    {
      captureOutput: true,
      cwd: context.projectRoot,
      scope: 'compose'
    }
  );

  return collectUniqueTextLines(result.stdout).map(normalizeImageReference);
}

/**
 * Returns the concrete Docker volume names for the selected Compose layers.
 */
export async function listConfiguredDockerVolumes(
  context: ProjectContext,
  options: Pick<GlobalCliOptions, never> & {
    withAiLlm?: boolean;
    withAiImage?: boolean;
    withWorkbench?: boolean;
  }
): Promise<Array<{ dockerName: string; logicalName: string }>> {
  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, ['config', '--volumes'], {
      includeAiLlm: Boolean(options.withAiLlm),
      includeAiImage: Boolean(options.withAiImage),
      includeWorkbench: Boolean(options.withWorkbench)
    }),
    {
      captureOutput: true,
      cwd: context.projectRoot,
      scope: 'compose'
    }
  );

  return collectUniqueTextLines(result.stdout).map((logicalName) => ({
    dockerName: `${APP_METADATA.codeName}_${logicalName}`,
    logicalName
  }));
}

/**
 * Parses the newline-delimited JSON emitted by `docker compose ps --format json`.
 */
export function parseComposePsEntries(stdout: string): ComposePsEntry[] {
  return stdout
    .split(/\r?\n/gu)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as ComposePsEntry);
}

/**
 * Extracts the distinct published host ports from a list of Compose `ps` entries.
 */
export function collectPublishedPorts(entries: ComposePsEntry[]): Set<number> {
  const publishedPorts = new Set<number>();

  for (const entry of entries) {
    for (const publisher of entry.Publishers ?? []) {
      if (typeof publisher.PublishedPort === 'number') {
        publishedPorts.add(publisher.PublishedPort);
      }
    }
  }

  return publishedPorts;
}

/**
 * Collects non-empty unique text lines while preserving the original order.
 */
function collectUniqueTextLines(stdout: string): string[] {
  return [...new Set(
    stdout
      .split(/\r?\n/gu)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  )];
}

/**
 * Normalizes Docker image references to their explicit `:latest` form when no tag is present.
 */
export function normalizeImageReference(image: string): string {
  if (image.includes('@')) {
    return image;
  }

  const finalSegment = image.split('/').at(-1) ?? image;
  return finalSegment.includes(':') ? image : `${image}:latest`;
}
