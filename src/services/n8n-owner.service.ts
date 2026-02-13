import { createComposeCommandArgs } from '../lib/compose.js';
import { readGatewayCertificate } from './gateway-certificate.service.js';
import type { BootstrapEnv, SmokeEnv, ProjectContext } from '../types/project.types.js';
import type { HttpsResponse } from '../types/http.types.js';
import type {
  N8nOwnerBootstrapResult,
  N8nOwnerSetupPayload,
  N8nOwnerSetupStatus
} from '../types/n8n.types.js';
import { requestHttps } from '../utils/http.js';
import { runCommand } from '../utils/process.js';

/**
 * Reconciles the n8n instance owner so the documented bootstrap credentials always work.
 */
export async function ensureN8nOwner(
  context: ProjectContext,
  env: BootstrapEnv
): Promise<N8nOwnerBootstrapResult> {
  const caCertificate = await readGatewayCertificate(context, 'bootstrap');

  if (await canLoginToN8n(env, caCertificate)) {
    return 'current';
  }

  const setupResponse = await setupN8nOwner(env, caCertificate);
  const setupStatus = classifyN8nOwnerSetupResponse(setupResponse);

  if (setupStatus === 'created') {
    return 'created';
  }

  if (setupStatus === 'already_setup') {
    await runCommand(
      'docker',
      createComposeCommandArgs(context, ['exec', '-T', 'n8n', 'n8n', 'user-management:reset']),
      {
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    const resetResponse = await setupN8nOwner(env, caCertificate);
    if (classifyN8nOwnerSetupResponse(resetResponse) === 'created') {
      return 'reset';
    }
  }

  throw new Error('Could not reconcile the n8n owner bootstrap account.');
}

/**
 * Performs an authenticated n8n login suitable for smoke checks.
 */
export async function canLoginToN8n(
  env: Pick<SmokeEnv, 'N8N_ROOT_EMAIL' | 'N8N_ROOT_PASSWORD' | 'N8N_URL'>,
  caCertificate: string
): Promise<boolean> {
  const response = await requestHttps(new URL('/rest/login', env.N8N_URL).toString(), {
    body: JSON.stringify({
      emailOrLdapLoginId: env.N8N_ROOT_EMAIL,
      password: env.N8N_ROOT_PASSWORD
    }),
    caCertificate,
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });

  return response.statusCode === 200 && hasCookie(response, 'n8n-auth=');
}

/**
 * Classifies the n8n owner-setup response so bootstrap can choose the next action.
 */
export function classifyN8nOwnerSetupResponse(response: HttpsResponse): N8nOwnerSetupStatus {
  if (response.statusCode === 200) {
    return 'created';
  }

  if (response.statusCode === 400 && response.body.includes('Instance owner already setup')) {
    return 'already_setup';
  }

  if (response.statusCode === 400) {
    return 'invalid_payload';
  }

  return 'unknown_error';
}

/**
 * Executes the n8n owner setup endpoint using the configured bootstrap credentials.
 */
async function setupN8nOwner(
  env: Pick<
    BootstrapEnv,
    'N8N_ROOT_EMAIL' | 'N8N_ROOT_FIRST_NAME' | 'N8N_ROOT_LAST_NAME' | 'N8N_ROOT_PASSWORD' | 'N8N_URL'
  >,
  caCertificate: string
): Promise<HttpsResponse> {
  const payload: N8nOwnerSetupPayload = {
    email: env.N8N_ROOT_EMAIL,
    firstName: env.N8N_ROOT_FIRST_NAME,
    lastName: env.N8N_ROOT_LAST_NAME,
    password: env.N8N_ROOT_PASSWORD
  };

  return requestHttps(new URL('/rest/owner/setup', env.N8N_URL).toString(), {
    body: JSON.stringify(payload),
    caCertificate,
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });
}

/**
 * Checks whether the response issued a session cookie.
 */
function hasCookie(response: HttpsResponse, cookiePrefix: string): boolean {
  const setCookieHeader = response.headers['set-cookie'];
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : typeof setCookieHeader === 'string'
      ? [setCookieHeader]
      : [];

  return cookies.some((cookie) => cookie.includes(cookiePrefix));
}
