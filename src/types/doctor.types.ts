/**
 * Result of a doctor host/smoke check.
 */
export interface HostCheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

/**
 * Definition of a concrete smoke check executed against the local lab.
 */
export interface SmokeCheckDefinition {
  name: string;
  run: (caCertificate: string) => Promise<HostCheckResult>;
}
