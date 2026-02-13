import { createComposeCommandArgs } from '../lib/compose.js';
import type { ComposePsEntry } from '../types/docker.types.js';
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
    createComposeCommandArgs(context, ['ps', '--status', 'running', '--format', 'json']),
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
