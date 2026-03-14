#!/usr/bin/env node
import { readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET_DIR = path.join(ROOT_DIR, 'infra', 'docker', 'images');
const PYTHON_CACHE_DIRNAME = '__pycache__';
const PYTHON_BYTECODE_REGEX = /\.py[co]$/u;

cleanPythonPackagingArtifacts(TARGET_DIR);

function cleanPythonPackagingArtifacts(directoryPath) {
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === PYTHON_CACHE_DIRNAME) {
        rmSync(entryPath, { recursive: true, force: true });
        continue;
      }

      cleanPythonPackagingArtifacts(entryPath);
      continue;
    }

    if (PYTHON_BYTECODE_REGEX.test(entry.name)) {
      rmSync(entryPath, { force: true });
    }
  }
}
