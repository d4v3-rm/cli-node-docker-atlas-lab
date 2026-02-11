import { createServer } from 'node:net';
import { getRunningComposePublishedPorts } from './compose-project.service.js';
import type {
  HostBindAddress,
  HostPortCheckResult,
  HostPortDefinition,
  HostPortProbeResult
} from '../types/preflight.types.js';
import type { LabEnv, ProjectContext } from '../types/project.types.js';

const CORE_PORT_ENV_KEYS = [
  'LAB_HTTPS_PORT',
  'GITEA_HTTPS_PORT',
  'N8N_HTTPS_PORT',
  'OPENWEBUI_HTTPS_PORT',
  'OLLAMA_HTTPS_PORT'
] as const;

const WORKBENCH_PORT_ENV_KEYS = [
  'NODE_DEV_HTTPS_PORT',
  'PYTHON_DEV_HTTPS_PORT',
  'AI_DEV_HTTPS_PORT',
  'CPP_DEV_HTTPS_PORT'
] as const;

const BIND_ADDRESSES: readonly HostBindAddress[] = ['0.0.0.0', '::'] as const;

/**
 * Fails fast when one or more published host ports are already occupied.
 */
export async function assertPublishedPortsAvailable(
  context: ProjectContext,
  options: {
    includeWorkbench: boolean;
  }
): Promise<void> {
  const definitions = getConfiguredHostPorts(context.env, options.includeWorkbench);
  const currentProjectPorts = await getRunningComposePublishedPorts(context);
  const results = await Promise.all(
    definitions.map((definition) => checkHostPort(definition, currentProjectPorts))
  );
  const unavailablePorts = results.filter((result) => !result.available);

  if (unavailablePorts.length === 0) {
    return;
  }

  const details = unavailablePorts
    .map((result) => `${result.port} (${result.envKey}) ${result.detail}`)
    .join('; ');

  throw new Error(`Host port preflight failed: ${details}`);
}

/**
 * Resolves the list of configured public ports that Compose will publish on the host.
 */
function getConfiguredHostPorts(env: LabEnv, includeWorkbench: boolean): HostPortDefinition[] {
  const envKeys = includeWorkbench
    ? [...CORE_PORT_ENV_KEYS, ...WORKBENCH_PORT_ENV_KEYS]
    : [...CORE_PORT_ENV_KEYS];

  return envKeys.map((envKey) => ({
    envKey,
    port: parseRequiredPort(env, envKey)
  }));
}

/**
 * Parses a required TCP port from the env and rejects invalid values early.
 */
function parseRequiredPort(env: LabEnv, envKey: string): number {
  const rawValue = env[envKey];
  const port = Number.parseInt(rawValue ?? '', 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid host port configuration for ${envKey}: ${rawValue ?? '<missing>'}`);
  }

  return port;
}

/**
 * Checks whether a TCP port can be bound on the local machine for both IPv4 and IPv6 wildcards.
 */
async function checkHostPort(
  definition: HostPortDefinition,
  currentProjectPorts: ReadonlySet<number>
): Promise<HostPortCheckResult> {
  const probeResults: HostPortProbeResult[] = [];

  for (const host of BIND_ADDRESSES) {
    probeResults.push(await probeBindAddress(definition.port, host));
  }

  const blockingProbe = probeResults.find((result) => result.supported && !result.available);

  if (blockingProbe) {
    if (currentProjectPorts.has(definition.port)) {
      return {
        ...definition,
        available: true,
        detail: 'already published by the current Atlas Lab stack'
      };
    }

    return {
      ...definition,
      available: false,
      detail: `${blockingProbe.detail} (bind ${blockingProbe.host})`
    };
  }

  return {
    ...definition,
    available: true,
    detail: 'available'
  };
}

/**
 * Probes a specific bind address so Windows wildcard listeners are detected before Compose starts.
 */
async function probeBindAddress(port: number, host: HostBindAddress): Promise<HostPortProbeResult> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', (error) => {
      if (isUnsupportedBindAddress(error)) {
        resolve({
          host,
          available: true,
          supported: false,
          detail: 'unsupported'
        });

        return;
      }

      resolve({
        host,
        available: false,
        supported: true,
        detail: formatPortError(error)
      });
    });

    server.listen(
      {
        host,
        port,
        exclusive: true
      },
      () => {
        server.close(() => {
          resolve({
            host,
            available: true,
            supported: true,
            detail: 'available'
          });
        });
      }
    );
  });
}

/**
 * Normalizes socket bind errors into short CLI-friendly details.
 */
function formatPortError(error: unknown): string {
  if (isNodeError(error) && error.code === 'EADDRINUSE') {
    return 'is already allocated on the host';
  }

  return error instanceof Error ? error.message : 'is unavailable';
}

/**
 * Ignores bind-address families that are not available on the current host.
 */
function isUnsupportedBindAddress(error: unknown): boolean {
  return isNodeError(error) && ['EAFNOSUPPORT', 'EINVAL'].includes(error.code ?? '');
}

/**
 * Narrows unknown values to Node.js-style system errors.
 */
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error;
}
