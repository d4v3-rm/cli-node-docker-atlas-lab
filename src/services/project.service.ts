import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import type { GlobalCliOptions } from '../types/cli.types.js';
import type { LabEnv, ProjectContext } from '../types/project.types.js';

const PROJECT_MARKERS = ['docker-compose.yml', '.env'] as const;

/**
 * Creates the runtime context used by commands that operate on a checkout.
 */
export function createProjectContext(options: GlobalCliOptions): ProjectContext {
  const projectRoot = resolveProjectRoot(options.projectDir);

  return {
    projectRoot,
    env: loadLabEnv(projectRoot)
  };
}

/**
 * Ensures that the required `.env` keys exist before a workflow starts.
 */
export function ensureEnvKeys<TKey extends keyof LabEnv>(
  env: LabEnv,
  keys: readonly TKey[]
): asserts env is LabEnv & Required<Pick<LabEnv, TKey>> {
  const missingKeys = keys.filter((key) => !env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required .env values: ${missingKeys.join(', ')}`);
  }
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

  const projectRoot = findProjectRoot(process.cwd());
  if (!projectRoot) {
    throw new Error(
      'Could not locate the lab project root from the current directory. Use --project-dir <path>.'
    );
  }

  return projectRoot;
}

/**
 * Loads the local `.env` file using the same parsing rules as runtime tooling.
 */
function loadLabEnv(projectRoot: string): LabEnv {
  return dotenv.parse(readFileSync(join(projectRoot, '.env'))) as LabEnv;
}

/**
 * Walks up the directory tree until the repository markers are found.
 */
function findProjectRoot(startDirectory: string): string | null {
  let currentDirectory = resolve(startDirectory);

  while (true) {
    if (isProjectRoot(currentDirectory)) {
      return currentDirectory;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return null;
    }

    currentDirectory = parentDirectory;
  }
}

/**
 * Validates an explicit project path passed by the user.
 */
function validateProjectRoot(projectRoot: string): void {
  if (!isProjectRoot(projectRoot)) {
    throw new Error(
      `Invalid project directory: ${projectRoot}. Expected docker-compose.yml and .env in that path.`
    );
  }
}

/**
 * Checks whether a folder looks like a valid lab checkout.
 */
function isProjectRoot(directory: string): boolean {
  return PROJECT_MARKERS.every((marker) => existsSync(join(directory, marker)));
}
