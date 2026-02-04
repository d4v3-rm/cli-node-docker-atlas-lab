#!/usr/bin/env node

import process from 'node:process';
import { runCli } from './main.mjs';

runCli().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
