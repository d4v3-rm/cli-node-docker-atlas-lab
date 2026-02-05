#!/usr/bin/env node

import process from 'node:process';
import { runCli } from '../src/main.mjs';

runCli().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
