import { createServer } from 'node:net';
import process from 'node:process';
import { getRunningComposePublishedPorts } from './compose-project.service.js';
import type {
  HostBindAddress,
  HostPortCheckResult,
  HostPortDefinition,
  HostPortProbeResult
} from '../types/preflight.types.js';
import type { LabEnv, ProjectContext } from '../types/project.types.js';
import { runCommand } from '../utils/process.js';

const CORE_PORT_ENV_KEYS = [
  'LAB_HTTPS_PORT',
  'GITEA_HTTPS_PORT',
  'N8N_HTTPS_PORT'
] as const;

const AI_PORT_ENV_KEYS = [
  'OPENWEBUI_HTTPS_PORT',
  'OLLAMA_HTTPS_PORT'
] as const;

const IMAGE_PORT_ENV_KEYS = ['INVOKEAI_HTTPS_PORT', 'SWARMUI_HTTPS_PORT'] as const;

const WORKBENCH_PORT_ENV_KEYS = [
  'POSTGRES_DEV_HOST_PORT',
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
    includeAi: boolean;
    includeImage: boolean;
    includeWorkbench: boolean;
  }
): Promise<void> {
  const definitions = getConfiguredHostPorts(
    context.env,
    options.includeWorkbench,
    options.includeAi,
    options.includeImage
  );
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
function getConfiguredHostPorts(
  env: LabEnv,
  includeWorkbench: boolean,
  includeAi: boolean,
  includeImage: boolean
): HostPortDefinition[] {
  const envKeys = [
    ...CORE_PORT_ENV_KEYS,
    ...(includeAi ? [...AI_PORT_ENV_KEYS] : []),
    ...(includeImage ? [...IMAGE_PORT_ENV_KEYS] : []),
    ...(includeWorkbench ? [...WORKBENCH_PORT_ENV_KEYS] : [])
  ];

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

    const detail = await enrichPortFailureDetail(definition.port, blockingProbe.detail);

    return {
      ...definition,
      available: false,
      detail: `${detail} (bind ${blockingProbe.host})`
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

  if (isNodeError(error) && error.code === 'EACCES') {
    return 'is unavailable on the host';
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

/**
 * Adds platform-specific detail for port probe failures.
 */
async function enrichPortFailureDetail(port: number, detail: string): Promise<string> {
  if (process.platform !== 'win32' || detail !== 'is unavailable on the host') {
    return detail;
  }

  const windowsRange = await findWindowsExcludedPortRange(port);
  if (!windowsRange) {
    return `${detail} (permission denied)`;
  }

  return `is reserved by Windows excluded port range ${windowsRange.start}-${windowsRange.end}`;
}

/**
 * Queries Windows reserved TCP port ranges and returns the matching range when present.
 */
async function findWindowsExcludedPortRange(
  port: number
): Promise<{ start: number; end: number } | null> {
  for (const family of ['ipv4', 'ipv6'] as const) {
    const result = await runCommand('netsh', ['interface', family, 'show', 'excludedportrange', 'protocol=tcp'], {
      allowFailure: true,
      captureOutput: true,
      scope: 'host'
    });

    if (result.exitCode !== 0) {
      continue;
    }

    const ranges = parseWindowsExcludedPortRanges(result.stdout);
    const matchingRange = ranges.find((range) => port >= range.start && port <= range.end);
    if (matchingRange) {
      return matchingRange;
    }
  }

  return null;
}

/**
 * Parses the `netsh interface ... show excludedportrange` output.
 */
function parseWindowsExcludedPortRanges(output: string): Array<{ start: number; end: number }> {
  return output
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.trim())
    .flatMap((line) => {
      const match = line.match(/^(\d+)\s+(\d+)(?:\s+\*)?$/u);
      if (!match) {
        return [];
      }

      return [
        {
          start: Number.parseInt(match[1], 10),
          end: Number.parseInt(match[2], 10)
        }
      ];
    });
}
