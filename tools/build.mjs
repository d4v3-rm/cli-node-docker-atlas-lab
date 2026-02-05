#!/usr/bin/env node

import { chmodSync, copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(toolDirectory, '..');
const outputRoot = join(projectRoot, 'dist');
const outputEntry = join(outputRoot, 'bin', 'lab-atlas.mjs');

rmSync(outputRoot, { recursive: true, force: true });
copyTree(join(projectRoot, 'bin'), join(outputRoot, 'bin'));
copyTree(join(projectRoot, 'src'), join(outputRoot, 'src'));

if (process.platform !== 'win32') {
  chmodSync(outputEntry, 0o755);
}

console.log(`Built ${outputEntry}`);

function copyTree(sourceDirectory, destinationDirectory) {
  mkdirSync(destinationDirectory, { recursive: true });

  for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = join(sourceDirectory, entry.name);
    const destinationPath = join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      copyTree(sourcePath, destinationPath);
      continue;
    }

    copyFileSync(sourcePath, destinationPath);
  }
}
