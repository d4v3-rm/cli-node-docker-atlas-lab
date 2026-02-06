import got from 'got';
import type { BasicAuthCredentials } from '../types/project.types.js';

/**
 * Performs a TLS-tolerant HTTPS GET request against local lab endpoints.
 */
export async function httpsGet(url: string, auth?: BasicAuthCredentials): Promise<number> {
  const response = await got.get(url, {
    https: {
      rejectUnauthorized: false
    },
    username: auth?.username,
    password: auth?.password,
    throwHttpErrors: false,
    retry: {
      limit: 0
    },
    timeout: {
      request: 10_000
    }
  });

  return response.statusCode;
}
