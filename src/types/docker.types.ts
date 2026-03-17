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
 * Metadata persisted inside a saved Docker image archive bundle.
 */
export interface ImageArchiveManifest {
  createdAt: string;
  images: string[];
  project: string;
}

/**
 * Metadata for a single archived Docker volume payload embedded in a bundle archive.
 */
export interface VolumeArchiveEntry {
  archiveFile: string;
  dockerName: string;
  logicalName: string;
}

/**
 * Metadata persisted inside a Docker volume bundle archive.
 */
export interface VolumeArchiveManifest {
  createdAt: string;
  project: string;
  volumes: VolumeArchiveEntry[];
}
