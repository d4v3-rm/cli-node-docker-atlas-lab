/**
 * Publisher entry returned by `docker compose ps --format json`.
 */
export interface ComposePortPublisher {
  PublishedPort?: number;
  Protocol?: string;
  TargetPort?: number;
  URL?: string;
}

/**
 * Minimal subset of the Compose `ps` JSON payload consumed by the CLI.
 */
export interface ComposePsEntry {
  Name?: string;
  Project?: string;
  Publishers?: ComposePortPublisher[];
  Service?: string;
  State?: string;
  Status?: string;
}

/**
 * Metadata persisted next to a saved Docker image archive.
 */
export interface ImageArchiveManifest {
  createdAt: string;
  images: string[];
  project: string;
}
