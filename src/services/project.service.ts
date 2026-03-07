import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { findUpSync } from 'find-up';
import { ZodError } from 'zod';
import {
  aiImageSmokeEnvSchema,
  aiLlmBootstrapEnvSchema,
  aiLlmSmokeEnvSchema,
  bootstrapEnvSchema,
  formatZodError,
  labEnvSchema,
  smokeEnvSchema
} from '../config/lab-env.schema.js';
import { PROJECT_MARKERS, REPOSITORY_PATHS, resolveRepositoryLayout } from '../config/repository-layout.js';
import { ensureDevelopmentFileLogging } from './runtime-log.service.js';
import type { GlobalCliOptions } from '../types/cli.types.js';
import type {
  AiImageSmokeEnv,
  AiLlmBootstrapEnv,
  AiLlmSmokeEnv,
  BootstrapEnv,
  LabEnv,
  ProjectContext,
  SmokeEnv
} from '../types/project.types.js';
import { printInfo } from '../ui/logger.js';

/**
 * Creates the runtime context used by commands that operate on a checkout.
 */
export function createProjectContext(options: GlobalCliOptions): ProjectContext {
  const workingDirectory = process.cwd();
  const resolution = resolveProjectRoot(options.projectDir, workingDirectory);
  const projectRoot = resolution.projectRoot;
  const layout = resolveRepositoryLayout(projectRoot);
  const fileLogSession = ensureDevelopmentFileLogging(projectRoot);

  if (fileLogSession.initializedNow && fileLogSession.filePath) {
    printInfo(`Development file log: ${fileLogSession.filePath}`, 'runtime');
  }

  return {
    projectRoot,
    runtimeSource: resolution.runtimeSource,
    workingDirectory,
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
 * Validates and narrows the env for AI LLM bootstrap workflows.
 */
export function parseAiLlmBootstrapEnv(env: LabEnv): AiLlmBootstrapEnv {
  return parseWithSchema(() => aiLlmBootstrapEnvSchema.parse(env));
}

/**
 * Validates and narrows the env for smoke-check workflows.
 */
export function parseSmokeEnv(env: LabEnv): SmokeEnv {
  return parseWithSchema(() => smokeEnvSchema.parse(env));
}

/**
 * Validates and narrows the env for AI LLM smoke-check workflows.
 */
export function parseAiLlmSmokeEnv(env: LabEnv): AiLlmSmokeEnv {
  return parseWithSchema(() => aiLlmSmokeEnvSchema.parse(env));
}

/**
 * Validates and narrows the env for AI image smoke-check workflows.
 */
export function parseAiImageSmokeEnv(env: LabEnv): AiImageSmokeEnv {
  return parseWithSchema(() => aiImageSmokeEnvSchema.parse(env));
}

/**
 * Resolves the lab asset root from an explicit path, the current checkout, or the installed package.
 */
export function resolveProjectRoot(
  explicitProjectDir?: string,
  cwd = process.cwd(),
  packagedProjectRoot = resolvePackagedProjectRoot()
): {
  projectRoot: string;
  runtimeSource: ProjectContext['runtimeSource'];
} {
  if (explicitProjectDir) {
    const projectRoot = resolve(explicitProjectDir);
    validateProjectRoot(projectRoot);
    return {
      projectRoot,
      runtimeSource: 'explicit-path'
    };
  }

  const projectRoot = findUpSync(
    (directory) => (isProjectRoot(directory) ? directory : undefined),
    {
      cwd,
      type: 'directory'
    }
  );
  if (!projectRoot) {
    if (isProjectRoot(packagedProjectRoot)) {
      return {
        projectRoot: packagedProjectRoot,
        runtimeSource: 'packaged-install'
      };
    }

    throw new Error('Could not locate the Atlas Lab assets from the current directory or the installed package.');
  }

  return {
    projectRoot,
    runtimeSource: 'checkout'
  };
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

/**
 * Resolves the package root that contains the bundled CLI and the embedded lab assets.
 */
export function resolvePackagedProjectRoot(moduleUrl = import.meta.url): string {
  const moduleFile = fileURLToPath(moduleUrl);
  return resolve(dirname(moduleFile), '..', '..');
}
