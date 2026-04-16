import { APP_METADATA } from '../config/app-metadata.js';
import type { UpCommandOptions } from '../types/cli.types.js';
import type { LabEnv, ProjectContext } from '../types/project.types.js';
import { printInfo } from '../ui/logger.js';
import { runCommand } from '../utils/process.js';
import { listConfiguredComposeImages, normalizeImageReference } from './compose-project.service.js';

const DEFAULT_DOCKER_HUB_MIRRORS = ['mirror.gcr.io', 'docker.1ms.run', 'docker.m.daocloud.io'] as const;
const DEFAULT_REGISTRY_PROXIES = ['docker.m.daocloud.io'] as const;
const DOCKER_HUB_REGISTRIES = ['docker.io/', 'index.docker.io/', 'registry-1.docker.io/'] as const;
const GATEWAY_BUILDER_IMAGE = 'node:22-alpine';
const IMAGE_PULL_ATTEMPTS = 3;

/**
 * Preloads missing Docker Hub images through pull-through mirrors so `atlas-lab up` keeps working without Docker Hub auth.
 */
export async function ensureStartupImagesAvailable(
  context: ProjectContext,
  options: Pick<UpCommandOptions, 'withAiLlm' | 'withWorkbench'>
): Promise<void> {
  const images = await listStartupImageReferences(context, options);
  if (images.length === 0) {
    return;
  }

  const mirrorHosts = parseDockerHubMirrorHosts(context.env.ATLAS_DOCKER_HUB_MIRRORS);
  const registryProxyHosts = parseRegistryProxyHosts(context.env.ATLAS_REGISTRY_PROXIES);
  let restoredImages = 0;

  for (const image of images) {
    const status = await ensureDockerImageAvailable(
      context.projectRoot,
      image,
      mirrorHosts,
      registryProxyHosts
    );

    if (status === 'restored') {
      restoredImages += 1;
    }
  }

  if (restoredImages > 0) {
    printInfo(
      `Prepared ${restoredImages} missing container image${restoredImages === 1 ? '' : 's'} before Compose startup.`,
      'stack'
    );
  }
}

/**
 * Resolves the full image set required by `atlas-lab up`, including local build base images.
 */
async function listStartupImageReferences(
  context: ProjectContext,
  options: Pick<UpCommandOptions, 'withAiLlm' | 'withWorkbench'>
): Promise<string[]> {
  const configuredImages = await listConfiguredComposeImages(context, options);
  const remoteRuntimeImages = configuredImages.filter((image) => !isLocalComposeBuildImage(image));
  const buildBaseImages = listBuildBaseImages(context.env, options);

  return [...new Set([...remoteRuntimeImages, ...buildBaseImages].map(normalizeImageReference))];
}

/**
 * Lists the upstream base images used by the locally built Dockerfiles.
 */
function listBuildBaseImages(
  env: Pick<
    LabEnv,
    'CADDY_VERSION' | 'NODE_DEV_BASE_IMAGE' | 'OLLAMA_VERSION' | 'PYTHON_DEV_BASE_IMAGE'
  >,
  options: Pick<UpCommandOptions, 'withAiLlm' | 'withWorkbench'>
): string[] {
  const images = [GATEWAY_BUILDER_IMAGE, `caddy:${env.CADDY_VERSION ?? '2.11.2-alpine'}`];

  if (options.withAiLlm) {
    images.push(`ollama/ollama:${env.OLLAMA_VERSION ?? '0.20.5'}`);
  }

  if (options.withWorkbench) {
    if (env.NODE_DEV_BASE_IMAGE) {
      images.push(env.NODE_DEV_BASE_IMAGE);
    }

    if (env.PYTHON_DEV_BASE_IMAGE) {
      images.push(env.PYTHON_DEV_BASE_IMAGE);
    }
  }

  return images;
}

/**
 * Detects the locally built Compose image tags that should never be prefetched from a registry.
 */
function isLocalComposeBuildImage(image: string): boolean {
  return normalizeImageReference(image).startsWith(`${APP_METADATA.codeName}-`);
}

/**
 * Ensures one Docker image is locally available, preferring configured mirrors before falling back to the original source.
 */
async function ensureDockerImageAvailable(
  projectRoot: string,
  image: string,
  mirrorHosts: string[],
  registryProxyHosts: string[]
): Promise<'present' | 'restored'> {
  if (await hasLocalDockerImage(projectRoot, image)) {
    return 'present';
  }

  const candidates = listDockerImageSourceCandidates(image, mirrorHosts, registryProxyHosts);
  const failureMessages: string[] = [];

  for (const candidate of candidates) {
    if (candidate !== image && (await hasLocalDockerImage(projectRoot, candidate))) {
      await tagDockerImage(projectRoot, candidate, image);
      await cleanupTemporaryDockerTag(projectRoot, candidate, image);
      printInfo(`Prepared ${image} from cached mirror tag ${candidate}`, 'stack');
      return 'restored';
    }

    printInfo(`Pulling ${image} via ${candidate}`, 'stack');
    const pullResult = await pullDockerImage(projectRoot, candidate);

    if (pullResult.exitCode !== 0) {
      const detail = pullResult.stderr || pullResult.stdout || `docker pull ${candidate} failed`;
      failureMessages.push(`${candidate}: ${detail.trim()}`);
      continue;
    }

    if (candidate !== image) {
      await tagDockerImage(projectRoot, candidate, image);
      await cleanupTemporaryDockerTag(projectRoot, candidate, image);
    }

    printInfo(`Prepared ${image} via ${candidate}`, 'stack');
    return 'restored';
  }

  throw new Error(
    [
      `Could not prepare the required Docker image ${image} from the configured mirrors or the origin registry.`,
      ...failureMessages.slice(-3)
    ].join('\n')
  );
}

/**
 * Pulls a remote image with a few retry attempts to smooth over transient registry and proxy failures.
 */
async function pullDockerImage(
  projectRoot: string,
  image: string
): Promise<{ exitCode: number; stderr: string; stdout: string }> {
  let lastResult = {
    exitCode: 1,
    stderr: '',
    stdout: ''
  };

  for (let attempt = 1; attempt <= IMAGE_PULL_ATTEMPTS; attempt += 1) {
    lastResult = await runCommand('docker', ['pull', image], {
      allowFailure: true,
      captureOutput: true,
      cwd: projectRoot,
      scope: 'stack'
    });

    if (lastResult.exitCode === 0) {
      return lastResult;
    }

    if (attempt < IMAGE_PULL_ATTEMPTS) {
      const retryDelayMilliseconds = attempt * 2000;
      printInfo(
        `Pull attempt ${attempt}/${IMAGE_PULL_ATTEMPTS} failed for ${image}; retrying in ${retryDelayMilliseconds / 1000}s.`,
        'stack'
      );
      await sleep(retryDelayMilliseconds);
    }
  }

  return lastResult;
}

/**
 * Returns whether the Docker daemon already has the requested tag available locally.
 */
async function hasLocalDockerImage(projectRoot: string, image: string): Promise<boolean> {
  const inspectResult = await runCommand('docker', ['image', 'inspect', image], {
    allowFailure: true,
    captureOutput: true,
    cwd: projectRoot,
    scope: 'stack'
  });

  return inspectResult.exitCode === 0;
}

/**
 * Tags a successfully mirrored image back to the canonical name expected by Compose and BuildKit.
 */
async function tagDockerImage(projectRoot: string, sourceImage: string, targetImage: string): Promise<void> {
  await runCommand('docker', ['image', 'tag', sourceImage, targetImage], {
    cwd: projectRoot,
    scope: 'stack'
  });
}

/**
 * Removes the temporary mirror tag so the local daemon keeps the canonical image name only.
 */
async function cleanupTemporaryDockerTag(
  projectRoot: string,
  sourceImage: string,
  targetImage: string
): Promise<void> {
  if (sourceImage === targetImage) {
    return;
  }

  await runCommand('docker', ['image', 'rm', sourceImage], {
    allowFailure: true,
    captureOutput: true,
    cwd: projectRoot,
    scope: 'stack'
  });
}

/**
 * Parses the optional mirror override from `env/lab.env`, falling back to the baked-in defaults.
 */
export function parseDockerHubMirrorHosts(rawMirrors?: string): string[] {
  return parseRegistryHostList(rawMirrors, [...DEFAULT_DOCKER_HUB_MIRRORS]);
}

/**
 * Parses the optional generic registry proxy override for registries such as GHCR and Quay.
 */
export function parseRegistryProxyHosts(rawProxies?: string): string[] {
  return parseRegistryHostList(rawProxies, [...DEFAULT_REGISTRY_PROXIES]);
}

/**
 * Normalizes a comma-separated registry host list, stripping protocols and duplicate entries.
 */
function parseRegistryHostList(rawHosts: string | undefined, defaultHosts: string[]): string[] {
  const normalizedHosts = rawHosts
    ?.split(/[,\n]/u)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => value.replace(/^https?:\/\//u, '').replace(/\/+$/u, ''));

  if (!normalizedHosts || normalizedHosts.length === 0) {
    return defaultHosts;
  }

  return [...new Set(normalizedHosts)];
}

/**
 * Builds the ordered list of pull candidates for a Docker Hub image.
 */
export function listDockerHubImageSourceCandidates(image: string, mirrorHosts: string[]): string[] {
  const repositoryPath = normalizeDockerHubRepositoryPath(image);

  if (!repositoryPath) {
    return [image];
  }

  return [...new Set([...mirrorHosts.map((mirrorHost) => `${mirrorHost}/${repositoryPath}`), image])];
}

/**
 * Returns the pull candidates for any image, using mirrors only for Docker Hub-backed refs.
 */
function listDockerImageSourceCandidates(
  image: string,
  mirrorHosts: string[],
  registryProxyHosts: string[]
): string[] {
  const dockerHubCandidates = listDockerHubImageSourceCandidates(image, mirrorHosts);

  if (dockerHubCandidates.length > 1 || dockerHubCandidates[0] !== image) {
    return dockerHubCandidates;
  }

  return [...new Set([image, ...registryProxyHosts.map((proxyHost) => `${proxyHost}/${image}`)])];
}

/**
 * Converts a Docker Hub image into its registry-relative repository path or returns `null` for non-Docker Hub refs.
 */
export function normalizeDockerHubRepositoryPath(image: string): string | null {
  const trimmedImage = image.trim();
  let normalizedImage = trimmedImage;

  for (const registryPrefix of DOCKER_HUB_REGISTRIES) {
    if (normalizedImage.startsWith(registryPrefix)) {
      normalizedImage = normalizedImage.slice(registryPrefix.length);
      break;
    }
  }

  const firstSegment = normalizedImage.split('/')[0] ?? normalizedImage;
  const containsPathSeparator = normalizedImage.includes('/');
  const usesExplicitRegistry =
    containsPathSeparator &&
    (firstSegment.includes('.') || firstSegment.includes(':') || firstSegment === 'localhost');

  if (usesExplicitRegistry) {
    return null;
  }

  return normalizedImage.includes('/') ? normalizedImage : `library/${normalizedImage}`;
}

/**
 * Small async sleep helper used for pull retries.
 */
function sleep(delayMilliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMilliseconds);
  });
}
