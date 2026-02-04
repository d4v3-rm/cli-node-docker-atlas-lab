#!/usr/bin/env node

import { chmodSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(toolDirectory, '..');
const sourcePath = join(projectRoot, 'src', 'cli.mjs');
const outputPath = join(projectRoot, 'dist', 'cli.mjs');

mkdirSync(dirname(outputPath), { recursive: true });
copyFileSync(sourcePath, outputPath);

if (process.platform !== 'win32') {
  chmodSync(outputPath, 0o755);
}

console.log(`Built ${outputPath}`);
