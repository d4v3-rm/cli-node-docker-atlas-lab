/**
 * Host port definition derived from the lab env configuration.
 */
export interface HostPortDefinition {
  envKey: string;
  port: number;
}

/**
 * Bind address probed during host-port preflight checks.
 */
export type HostBindAddress = '0.0.0.0' | '::';

/**
 * Result of checking whether a host TCP port is available.
 */
export interface HostPortCheckResult extends HostPortDefinition {
  available: boolean;
  detail: string;
}

/**
 * Result of probing a single bind address for a host TCP port.
 */
export interface HostPortProbeResult {
  host: HostBindAddress;
  available: boolean;
  supported: boolean;
  detail: string;
}
