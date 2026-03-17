import type { BasicAuthCredentials } from './project.types.js';

/**
 * Supported HTTPS request options for lab-facing checks and bootstrap calls.
 */
export interface HttpsRequestOptions {
  auth?: BasicAuthCredentials;
  body?: string;
  caCertificate?: string;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST';
}

/**
 * Minimal HTTPS response shape returned by the shared HTTP helpers.
 */
export interface HttpsResponse {
  body: string;
  headers: Record<string, string | string[] | undefined>;
  statusCode: number;
}
