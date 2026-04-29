import got from 'got';
import type { HttpsRequestOptions, HttpsResponse } from '../types/http.types.js';

/**
 * Performs an HTTPS request against a local lab endpoint and returns the raw response payload.
 */
export async function requestHttps(
  url: string,
  {
    auth,
    body,
    caCertificate,
    followRedirect = true,
    headers,
    method = 'GET'
  }: HttpsRequestOptions = {}
): Promise<HttpsResponse> {
  const response = await got(url, {
    body,
    followRedirect,
    headers,
    https: resolveHttpsOptions(caCertificate),
    method,
    password: auth?.password,
    throwHttpErrors: false,
    retry: {
      limit: 0
    },
    timeout: {
      request: 10_000
    },
    username: auth?.username
  });

  return {
    body: response.body,
    headers: response.headers,
    statusCode: response.statusCode
  };
}

/**
 * Uses the live gateway certificate when available and only falls back to insecure mode when absent.
 */
function resolveHttpsOptions(caCertificate?: string) {
  if (caCertificate) {
    return {
      certificateAuthority: caCertificate
    };
  }

  return {
    rejectUnauthorized: false
  };
}
