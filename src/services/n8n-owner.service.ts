import pWaitFor from 'p-wait-for';
import { createComposeCommandArgs } from '../lib/compose.js';
import { readGatewayCertificate } from './gateway-certificate.service.js';
import type { AiLlmBootstrapEnv, AiLlmSmokeEnv, ProjectContext } from '../types/project.types.js';
import type { HttpsResponse } from '../types/http.types.js';
import type {
  N8nOwnerBootstrapResult,
  N8nOwnerSetupPayload,
  N8nOwnerSetupStatus
} from '../types/n8n.types.js';
import { printInfo, printSuccess } from '../ui/logger.js';
import { requestHttps } from '../utils/http.js';
import { runCommand } from '../utils/process.js';

/**
 * Reconciles the n8n instance owner so the documented bootstrap credentials always work.
 */
export async function ensureN8nOwner(
  context: ProjectContext,
  env: AiLlmBootstrapEnv
): Promise<N8nOwnerBootstrapResult> {
  const caCertificate = await readGatewayCertificate(context, 'bootstrap');
  await waitForN8nIngress(env.N8N_URL, caCertificate);

  if (await canLoginToN8n(env, caCertificate)) {
    printInfo('n8n owner credentials already match the configured bootstrap account.', 'bootstrap');
    return 'current';
  }

  printInfo('n8n owner bootstrap account is not active yet. Attempting owner setup.', 'bootstrap');
  const setupResponse = await setupN8nOwner(env, caCertificate);
  const setupStatus = classifyN8nOwnerSetupResponse(setupResponse);

  if (setupStatus === 'created') {
    printSuccess('n8n owner bootstrap account created.', 'bootstrap');
    return 'created';
  }

  if (setupStatus === 'already_setup') {
    printInfo('n8n reports an existing owner. Resetting owner management to reconcile credentials.', 'bootstrap');
    await runCommand(
      'docker',
      createComposeCommandArgs(context, ['exec', '-T', 'n8n', 'n8n', 'user-management:reset'], {
        includeAiLlm: true
      }),
      {
        cwd: context.projectRoot,
        scope: 'bootstrap'
      }
    );

    const resetResponse = await setupN8nOwner(env, caCertificate);
    if (classifyN8nOwnerSetupResponse(resetResponse) === 'created') {
      printSuccess('n8n owner bootstrap account recreated after reset.', 'bootstrap');
      return 'reset';
    }
  }

  throw new Error('Could not reconcile the n8n owner bootstrap account.');
}

/**
 * Waits until the gateway can terminate TLS and forward requests to the n8n ingress.
 */
async function waitForN8nIngress(
  n8nUrl: string,
  caCertificate: string,
  timeoutSeconds = 30
): Promise<void> {
  let attempts = 0;

  await pWaitFor(
    async () => {
      try {
        const response = await requestHttps(n8nUrl, { caCertificate });
        const isReady = response.statusCode >= 200 && response.statusCode < 500;

        if (!isReady) {
          reportN8nIngressWait(n8nUrl, attempts);
          attempts += 1;
        }

        return isReady;
      } catch {
        reportN8nIngressWait(n8nUrl, attempts);
        attempts += 1;
        return false;
      }
    },
    {
      interval: 1_000,
      timeout: {
        milliseconds: timeoutSeconds * 1000,
        message: new Error(`Timed out waiting for n8n HTTPS ingress at ${n8nUrl}`)
      }
    }
  );

  printSuccess(`n8n HTTPS ingress is reachable at ${n8nUrl}.`, 'bootstrap');
}

/**
 * Emits a periodic wait line while the HTTPS ingress is still warming up.
 */
function reportN8nIngressWait(n8nUrl: string, attempts: number): void {
  if (attempts === 0 || attempts % 5 === 0) {
    printInfo(`Waiting for n8n HTTPS ingress at ${n8nUrl} (${attempts}s elapsed).`, 'bootstrap');
  }
}

/**
 * Performs an authenticated n8n login suitable for smoke checks.
 */
export async function canLoginToN8n(
  env: Pick<AiLlmSmokeEnv, 'N8N_ROOT_EMAIL' | 'N8N_ROOT_PASSWORD' | 'N8N_URL'>,
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
    AiLlmBootstrapEnv,
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
