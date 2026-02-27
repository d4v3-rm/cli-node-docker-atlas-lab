import i18n from '@/i18n';
import type { LabRuntimeConfig } from '@/types/lab-config.types';

const LAB_CONFIG_PATH = '/runtime/lab-config.json';

/**
 * Loads the runtime configuration emitted by the gateway container startup.
 */
export async function loadLabConfig(): Promise<LabRuntimeConfig> {
  const response = await fetch(LAB_CONFIG_PATH, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(
      i18n.t('errors.runtimeFetchFailed', {
        path: LAB_CONFIG_PATH,
        status: response.status
      })
    );
  }

  const payloadText = await response.text();
  let payload: unknown;

  try {
    payload = JSON.parse(payloadText) as unknown;
  } catch (error) {
    const normalizedPayload = payloadText.trimStart().toLowerCase();

    if (
      normalizedPayload.startsWith('<!doctype') ||
      normalizedPayload.startsWith('<html')
    ) {
      throw new Error(i18n.t('errors.runtimeHtmlFallback'));
    }

    throw new Error(
      error instanceof Error
        ? i18n.t('errors.runtimeInvalidResponseWithReason', {
            reason: error.message
          })
        : i18n.t('errors.runtimeInvalidResponse')
    );
  }

  assertLabRuntimeConfig(payload);
  return payload;
}

/**
 * Performs a small runtime validation so the React app fails with a clear error.
 */
function assertLabRuntimeConfig(value: unknown): asserts value is LabRuntimeConfig {
  if (!value || typeof value !== 'object') {
    throw new Error(i18n.t('errors.invalidRuntimeObject'));
  }

  const candidate = value as Record<string, unknown>;
  if (!candidate.features || !candidate.lab || !candidate.services || !candidate.workbenches) {
    throw new Error(i18n.t('errors.runtimeIncomplete'));
  }
}
