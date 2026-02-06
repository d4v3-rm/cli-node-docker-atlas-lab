import type { BasicAuthCredentials } from './project.types.js';

/**
 * Result of a doctor host/smoke check.
 */
export interface HostCheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

/**
 * Definition of an HTTPS smoke check.
 */
export interface SmokeCheckDefinition {
  name: string;
  url: string;
  auth?: BasicAuthCredentials;
}
