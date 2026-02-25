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
    throw new Error(`Impossibile leggere ${LAB_CONFIG_PATH} (${response.status}).`);
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
      throw new Error(
        'La config runtime non e disponibile: avvia Atlas Lab tramite gateway oppure usa npm run dev:atlas-dashboard.'
      );
    }

    throw new Error(
      error instanceof Error
        ? `Risposta runtime non valida: ${error.message}`
        : 'Risposta runtime non valida.'
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
    throw new Error('Configurazione runtime assente o non valida.');
  }

  const candidate = value as Record<string, unknown>;
  if (!candidate.features || !candidate.lab || !candidate.services || !candidate.workbenches) {
    throw new Error('Configurazione runtime incompleta.');
  }
}
