/**
 * Owner payload accepted by the n8n `POST /rest/owner/setup` endpoint.
 */
export interface N8nOwnerSetupPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Bootstrap outcome after reconciling the n8n owner account.
 */
export type N8nOwnerBootstrapResult = 'current' | 'created' | 'reset';

/**
 * Coarse classification of n8n auth/setup HTTP outcomes.
 */
export type N8nOwnerSetupStatus = 'created' | 'already_setup' | 'invalid_payload' | 'unknown_error';
