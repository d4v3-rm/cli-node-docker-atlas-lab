import https from 'node:https';
import type { BasicAuthCredentials } from '../types/project.types.js';

/**
 * Performs a TLS-tolerant HTTPS GET request against local lab endpoints.
 */
export function httpsGet(url: string, auth?: BasicAuthCredentials): Promise<number> {
  return new Promise((resolvePromise, rejectPromise) => {
    const requestUrl = new URL(url);
    const headers: Record<string, string> = {};

    if (auth) {
      const credentials = Buffer.from(`${auth.username}:${auth.password}`, 'utf8').toString('base64');
      headers.authorization = `Basic ${credentials}`;
    }

    const request = https.request(
      requestUrl,
      {
        method: 'GET',
        headers,
        rejectUnauthorized: false,
        timeout: 10_000
      },
      (response) => {
        response.resume();
        response.on('end', () => {
          resolvePromise(response.statusCode ?? 0);
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', rejectPromise);
    request.end();
  });
}
