import { commandBootstrap } from './bootstrap.mjs';
import { runCommand } from '../lib/system.mjs';

const LEGACY_IMAGES = ['cli-node-lab-ollama-init:latest'];

export function commandStatus(projectRoot) {
  runCommand('docker', ['compose', 'ps', '--all'], { cwd: projectRoot });
}

export function commandDown(projectRoot) {
  console.log('Stopping the lab stack...');
  runCommand('docker', ['compose', 'down', '--remove-orphans'], { cwd: projectRoot });
}

export async function commandUp(projectRoot, env, options) {
  const composeArgs = ['compose'];

  if (options.withWorkbench) {
    composeArgs.push('--profile', 'workbench');
  }

  composeArgs.push('up', '-d', '--remove-orphans');

  if (options.build) {
    composeArgs.push('--build');
  }

  console.log('Starting the lab stack with Docker Compose...');
  runCommand('docker', composeArgs, { cwd: projectRoot });
  await commandBootstrap(projectRoot, env, {
    skipGitea: false,
    skipOllama: false
  });
  console.log('Cleaning legacy init images, if any...');
  cleanupLegacyImages(projectRoot);
  console.log('Lab stack ready.');
}

function cleanupLegacyImages(projectRoot) {
  for (const image of LEGACY_IMAGES) {
    runCommand('docker', ['image', 'rm', '-f', image], {
      cwd: projectRoot,
      allowFailure: true,
      stdio: 'ignore'
    });
  }
}
