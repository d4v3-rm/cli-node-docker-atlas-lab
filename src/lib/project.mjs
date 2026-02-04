import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

const PROJECT_MARKERS = ['docker-compose.yml', '.env'];

export function resolveProjectRoot(explicitProjectDir) {
  if (explicitProjectDir) {
    const projectRoot = resolve(explicitProjectDir);
    validateProjectRoot(projectRoot);
    return projectRoot;
  }

  const found = findProjectRoot(process.cwd());
  if (!found) {
    throw new Error(
      'Could not locate the lab project root from the current directory. Use --project-dir <path>.'
    );
  }

  return found;
}

export function parseEnvFile(projectRoot) {
  const content = readFileSync(join(projectRoot, '.env'), 'utf8');
  const values = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

export function requireEnvKeys(env, keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required .env values: ${missing.join(', ')}`);
  }
}

function findProjectRoot(startDirectory) {
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

function validateProjectRoot(projectRoot) {
  if (!isProjectRoot(projectRoot)) {
    throw new Error(
      `Invalid project directory: ${projectRoot}. Expected docker-compose.yml and .env in that path.`
    );
  }
}

function isProjectRoot(directory) {
  return PROJECT_MARKERS.every((marker) => existsSync(join(directory, marker)));
}
