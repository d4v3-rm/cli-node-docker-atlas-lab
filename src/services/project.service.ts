import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { findUpSync } from 'find-up';
import { ZodError } from 'zod';
import { bootstrapEnvSchema, formatZodError, labEnvSchema, smokeEnvSchema } from '../config/lab-env.schema.js';
import { PROJECT_MARKERS, REPOSITORY_PATHS, resolveRepositoryLayout } from '../config/repository-layout.js';
import type { GlobalCliOptions } from '../types/cli.types.js';
import type { BootstrapEnv, LabEnv, ProjectContext, SmokeEnv } from '../types/project.types.js';

/**
 * Creates the runtime context used by commands that operate on a checkout.
 */
export function createProjectContext(options: GlobalCliOptions): ProjectContext {
  const projectRoot = resolveProjectRoot(options.projectDir);
  const layout = resolveRepositoryLayout(projectRoot);

  return {
    projectRoot,
    layout,
    env: loadLabEnv(layout.envFile)
  };
}

/**
 * Validates and narrows the env for bootstrap workflows.
 */
export function parseBootstrapEnv(env: LabEnv): BootstrapEnv {
  return parseWithSchema(() => bootstrapEnvSchema.parse(env));
}

/**
 * Validates and narrows the env for smoke-check workflows.
 */
export function parseSmokeEnv(env: LabEnv): SmokeEnv {
  return parseWithSchema(() => smokeEnvSchema.parse(env));
}

/**
 * Resolves the project root either from `--project-dir` or from the cwd.
 */
export function resolveProjectRoot(explicitProjectDir?: string): string {
  if (explicitProjectDir) {
    const projectRoot = resolve(explicitProjectDir);
    validateProjectRoot(projectRoot);
    return projectRoot;
  }

  const projectRoot = findUpSync(
    (directory) => (isProjectRoot(directory) ? directory : undefined),
    {
      cwd: process.cwd(),
      type: 'directory'
    }
  );
  if (!projectRoot) {
    throw new Error(
      'Could not locate the lab project root from the current directory. Use --project-dir <path>.'
    );
  }

  return projectRoot;
}

/**
 * Loads the lab env file using the same parsing rules as runtime tooling.
 */
function loadLabEnv(envFile: string): LabEnv {
  return parseWithSchema(() => labEnvSchema.parse(dotenv.parse(readFileSync(envFile))));
}

/**
 * Centralizes Zod parsing so services get readable validation errors.
 */
function parseWithSchema<TValue>(parse: () => TValue): TValue {
  try {
    return parse();
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Invalid ${REPOSITORY_PATHS.envFile}: ${formatZodError(error)}`);
    }

    throw error;
  }
}

/**
 * Validates an explicit project path passed by the user.
 */
function validateProjectRoot(projectRoot: string): void {
  if (!isProjectRoot(projectRoot)) {
    throw new Error(
      `Invalid project directory: ${projectRoot}. Expected ${REPOSITORY_PATHS.composeFile} and ${REPOSITORY_PATHS.envFile} in that path.`
    );
  }
}

/**
 * Checks whether a folder looks like a valid lab checkout.
 */
function isProjectRoot(directory: string): boolean {
  return PROJECT_MARKERS.every((marker) => existsSync(join(directory, marker)));
}
