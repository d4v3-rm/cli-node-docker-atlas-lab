import process from 'node:process';
import { APP_METADATA } from './app-metadata.js';
import type { RuntimeMode } from '../types/runtime.types.js';

const DEVELOPMENT_ENTRYPOINTS = [
  `/src/cli/${APP_METADATA.cliName}.ts`,
  '/src/cli/lab-atlas.ts'
] as const;

/**
 * Resolves the current runtime mode from an explicit env override or from the entrypoint path.
 */
export function getRuntimeMode(): RuntimeMode {
  const explicitMode = normalizeRuntimeMode(process.env.ATLAS_LAB_RUNTIME);
  if (explicitMode) {
    return explicitMode;
  }

  const entrypoint = (process.argv[1] ?? '').replace(/\\/gu, '/');
  return DEVELOPMENT_ENTRYPOINTS.some((candidate) => entrypoint.endsWith(candidate))
    ? 'development'
    : 'production';
}

/**
 * Reports whether the current invocation is running from the TypeScript development entrypoint.
 */
export function isDevelopmentRuntime(): boolean {
  return getRuntimeMode() === 'development';
}

/**
 * Narrows the runtime override to the supported values only.
 */
function normalizeRuntimeMode(value: string | undefined): RuntimeMode | undefined {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === 'development' || normalizedValue === 'production') {
    return normalizedValue;
  }

  return undefined;
}
