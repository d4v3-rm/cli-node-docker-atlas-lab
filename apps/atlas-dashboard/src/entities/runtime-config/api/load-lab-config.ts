import i18n from '@/shared/config/i18n';
import {
  parseLabRuntimeConfig,
  type LabRuntimeConfig
} from '@/entities/runtime-config/model/lab-runtime-config.schema';

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

  return parseLabRuntimeConfig(payload);
}
