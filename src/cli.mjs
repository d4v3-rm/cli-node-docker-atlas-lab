#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import https from 'node:https';
import { dirname, resolve, join } from 'node:path';
import process from 'node:process';

const LEGACY_IMAGES = ['cli-node-lab-ollama-init:latest'];
const GITEA_CONFIG = '/data/gitea/conf/app.ini';

const HELP_TEXT = `Lab Atlas CLI

Usage:
  lab-atlas <command> [options]

Commands:
  up           Start Docker Compose, run bootstrap, clean legacy artifacts
  bootstrap    Run the idempotent bootstrap only
  doctor       Check host requirements and optionally run smoke tests
  status       Show Docker Compose status
  down         Stop the lab stack
  help         Show this help

Options:
  --project-dir <path>   Explicit project root if you are not in the repo

Examples:
  lab-atlas up
  lab-atlas up --build --with-workbench
  lab-atlas bootstrap
  lab-atlas doctor --smoke
  lab-atlas status --project-dir C:\\path\\to\\cli-node-lab`;

async function main() {
  const parsed = parseCli(process.argv.slice(2));

  if (parsed.help || parsed.command === 'help') {
    console.log(HELP_TEXT);
    return;
  }

  const projectRoot = resolveProjectRoot(parsed.projectDir);
  const env = parseEnvFile(join(projectRoot, '.env'));

  switch (parsed.command) {
    case 'up':
      await commandUp(projectRoot, env, parsed.commandOptions);
      return;
    case 'bootstrap':
      await commandBootstrap(projectRoot, env, parsed.commandOptions);
      return;
    case 'doctor':
      await commandDoctor(projectRoot, env, parsed.commandOptions);
      return;
    case 'status':
      commandStatus(projectRoot);
      return;
    case 'down':
      commandDown(projectRoot);
      return;
    default:
      throw new Error(`Unknown command: ${parsed.command}`);
  }
}

function parseCli(argv) {
  let command;
  let projectDir;
  let help = false;
  const commandArgs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--project-dir') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --project-dir');
      }
      projectDir = value;
      index += 1;
      continue;
    }

    if (token === '--help' || token === '-h') {
      help = true;
      continue;
    }

    if (!command && !token.startsWith('-')) {
      command = token;
      continue;
    }

    commandArgs.push(token);
  }

  command ??= 'help';

  return {
    command,
    help,
    projectDir,
    commandOptions: parseCommandOptions(command, commandArgs)
  };
}

function parseCommandOptions(command, args) {
  const optionMap = {
    up: { '--build': 'build', '--with-workbench': 'withWorkbench' },
    bootstrap: { '--skip-gitea': 'skipGitea', '--skip-ollama': 'skipOllama' },
    doctor: { '--smoke': 'smoke' },
    status: {},
    down: {},
    help: {}
  };

  const options = {
    build: false,
    withWorkbench: false,
    skipGitea: false,
    skipOllama: false,
    smoke: false
  };

  const allowedOptions = optionMap[command];
  if (!allowedOptions) {
    throw new Error(`Unknown command: ${command}`);
  }

  for (const token of args) {
    const optionKey = allowedOptions[token];
    if (!optionKey) {
      throw new Error(`Unknown option for ${command}: ${token}`);
    }
    options[optionKey] = true;
  }

  return options;
}

function resolveProjectRoot(explicitProjectDir) {
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

function isProjectRoot(directory) {
  return existsSync(join(directory, 'docker-compose.yml')) && existsSync(join(directory, '.env'));
}

function validateProjectRoot(projectRoot) {
  if (!isProjectRoot(projectRoot)) {
    throw new Error(
      `Invalid project directory: ${projectRoot}. Expected docker-compose.yml and .env in that path.`
    );
  }
}

function parseEnvFile(path) {
  const content = readFileSync(path, 'utf8');
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

function commandStatus(projectRoot) {
  runCommand('docker', ['compose', 'ps', '--all'], { cwd: projectRoot });
}

function commandDown(projectRoot) {
  console.log('Stopping the lab stack...');
  runCommand('docker', ['compose', 'down', '--remove-orphans'], { cwd: projectRoot });
}

async function commandUp(projectRoot, env, options) {
  requireEnvKeys(env, ['GITEA_UID', 'GITEA_GID', 'GITEA_ROOT_USERNAME', 'GITEA_ROOT_PASSWORD', 'GITEA_ROOT_EMAIL', 'OLLAMA_EMBEDDING_MODEL']);
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

async function commandBootstrap(projectRoot, env, options) {
  requireEnvKeys(env, ['GITEA_UID', 'GITEA_GID', 'GITEA_ROOT_USERNAME', 'GITEA_ROOT_PASSWORD', 'GITEA_ROOT_EMAIL', 'OLLAMA_EMBEDDING_MODEL']);

  if (!options.skipGitea) {
    await bootstrapGitea(projectRoot, env);
  }

  if (!options.skipOllama) {
    await bootstrapOllama(projectRoot, env);
  }
}

async function bootstrapGitea(projectRoot, env) {
  await waitForService(projectRoot, 'gitea');

  const baseArgs = [
    'compose',
    'exec',
    '-T',
    '--user',
    `${env.GITEA_UID}:${env.GITEA_GID}`,
    'gitea',
    'gitea',
    'admin',
    'user'
  ];

  const listing = runCommand('docker', [...baseArgs, 'list', '--config', GITEA_CONFIG], {
    cwd: projectRoot,
    captureOutput: true
  }).stdout;

  if (listing.includes(env.GITEA_ROOT_USERNAME)) {
    runCommand(
      'docker',
      [
        ...baseArgs,
        'change-password',
        '--config',
        GITEA_CONFIG,
        '--username',
        env.GITEA_ROOT_USERNAME,
        '--password',
        env.GITEA_ROOT_PASSWORD
      ],
      { cwd: projectRoot }
    );
    console.log('Gitea admin password updated.');
    return;
  }

  runCommand(
    'docker',
    [
      ...baseArgs,
      'create',
      '--config',
      GITEA_CONFIG,
      '--username',
      env.GITEA_ROOT_USERNAME,
      '--password',
      env.GITEA_ROOT_PASSWORD,
      '--email',
      env.GITEA_ROOT_EMAIL,
      '--admin',
      '--must-change-password=false'
    ],
    { cwd: projectRoot }
  );
  console.log('Gitea admin user created.');
}

async function bootstrapOllama(projectRoot, env) {
  await waitForService(projectRoot, 'ollama');
  const model = env.OLLAMA_EMBEDDING_MODEL;

  const showResult = runCommand(
    'docker',
    ['compose', 'exec', '-T', 'ollama', 'ollama', 'show', model],
    {
      cwd: projectRoot,
      captureOutput: true,
      allowFailure: true
    }
  );

  if (showResult.status === 0) {
    console.log(`Ollama model already present: ${model}`);
    return;
  }

  runCommand('docker', ['compose', 'exec', '-T', 'ollama', 'ollama', 'pull', model], {
    cwd: projectRoot
  });
  console.log(`Ollama model pulled: ${model}`);
}

async function waitForService(projectRoot, service, timeoutSeconds = 180) {
  const deadline = Date.now() + timeoutSeconds * 1000;

  while (Date.now() < deadline) {
    const containerId = runCommand('docker', ['compose', 'ps', '-q', service], {
      cwd: projectRoot,
      captureOutput: true
    }).stdout.trim();

    if (containerId) {
      const state = runCommand(
        'docker',
        [
          'inspect',
          '--format',
          '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}',
          containerId
        ],
        {
          cwd: projectRoot,
          captureOutput: true
        }
      ).stdout.trim();

      if (state === 'healthy' || state === 'running') {
        return;
      }
    }

    await sleep(2000);
  }

  throw new Error(`Timed out waiting for service '${service}' to become healthy`);
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

async function commandDoctor(projectRoot, env, options) {
  const results = [];

  results.push(checkCommand('docker', ['--version'], 'Docker CLI'));
  results.push(checkCommand('docker', ['compose', 'version', '--short'], 'Docker Compose v2'));
  results.push(checkCommand('docker', ['info', '--format', '{{.ServerVersion}}'], 'Docker daemon'));
  results.push(checkNodeVersion());
  results.push(checkCommand(...npmCheckCommand()));
  results.push(checkComposeConfig(projectRoot));
  results.push(...checkRequiredFiles(projectRoot));

  if (options.smoke) {
    const smokeResults = await runSmokeChecks(env);
    results.push(...smokeResults);
  }

  let failures = 0;
  for (const result of results) {
    const statusLabel = result.ok ? 'ok' : 'fail';
    console.log(`[${statusLabel}] ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
    if (!result.ok) {
      failures += 1;
    }
  }

  if (failures > 0) {
    throw new Error(`Doctor found ${failures} issue(s).`);
  }
}

function checkNodeVersion() {
  try {
    const version = process.versions.node;
    const major = Number.parseInt(version.split('.')[0], 10);
    if (Number.isNaN(major) || major < 20) {
      return {
        name: 'Node.js',
        ok: false,
        detail: `Unsupported version ${version}. Node.js >= 20 is required.`
      };
    }

    return {
      name: 'Node.js',
      ok: true,
      detail: `v${version}`
    };
  } catch (error) {
    return {
      name: 'Node.js',
      ok: false,
      detail: error.message
    };
  }
}

function checkCommand(command, args, name) {
  try {
    const result = runCommand(command, args, { captureOutput: true, allowFailure: true });
    if (result.status !== 0) {
      return {
        name,
        ok: false,
        detail: sanitizeDetail(result.stderr || result.stdout)
      };
    }
    return {
      name,
      ok: true,
      detail: sanitizeDetail(result.stdout)
    };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error.message
    };
  }
}

function npmCheckCommand() {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', '--version'], 'npm'];
  }

  return ['npm', ['--version'], 'npm'];
}

function checkComposeConfig(projectRoot) {
  try {
    const result = runCommand('docker', ['compose', 'config', '-q'], {
      cwd: projectRoot,
      captureOutput: true,
      allowFailure: true
    });

    if (result.status !== 0) {
      return {
        name: 'Compose configuration',
        ok: false,
        detail: sanitizeDetail(result.stderr || result.stdout)
      };
    }

    return {
      name: 'Compose configuration',
      ok: true,
      detail: 'docker-compose.yml parsed successfully'
    };
  } catch (error) {
    return {
      name: 'Compose configuration',
      ok: false,
      detail: error.message
    };
  }
}

function checkRequiredFiles(projectRoot) {
  const requiredFiles = ['docker-compose.yml', '.env', 'gateway/templates/Caddyfile.template'];

  return requiredFiles.map((relativePath) => {
    const fullPath = join(projectRoot, relativePath);
    return {
      name: `Required file ${relativePath}`,
      ok: existsSync(fullPath),
      detail: fullPath
    };
  });
}

async function runSmokeChecks(env) {
  requireEnvKeys(env, [
    'LAB_URL',
    'GITEA_URL',
    'N8N_URL',
    'OPENWEBUI_URL',
    'OLLAMA_URL',
    'N8N_GATEWAY_USER',
    'N8N_GATEWAY_PASSWORD',
    'OLLAMA_GATEWAY_USER',
    'OLLAMA_GATEWAY_PASSWORD'
  ]);

  const checks = [
    {
      name: 'Smoke deck',
      url: env.LAB_URL
    },
    {
      name: 'Smoke Gitea',
      url: env.GITEA_URL
    },
    {
      name: 'Smoke n8n',
      url: env.N8N_URL,
      auth: {
        username: env.N8N_GATEWAY_USER,
        password: env.N8N_GATEWAY_PASSWORD
      }
    },
    {
      name: 'Smoke Open WebUI',
      url: env.OPENWEBUI_URL
    },
    {
      name: 'Smoke Ollama',
      url: new URL('/api/tags', env.OLLAMA_URL).toString(),
      auth: {
        username: env.OLLAMA_GATEWAY_USER,
        password: env.OLLAMA_GATEWAY_PASSWORD
      }
    }
  ];

  const results = [];
  for (const check of checks) {
    try {
      const response = await httpsGet(check.url, check.auth);
      const ok = response.statusCode >= 200 && response.statusCode < 400;
      results.push({
        name: check.name,
        ok,
        detail: `HTTP ${response.statusCode}`
      });
    } catch (error) {
      results.push({
        name: check.name,
        ok: false,
        detail: error.message
      });
    }
  }

  return results;
}

function httpsGet(url, auth) {
  return new Promise((resolvePromise, rejectPromise) => {
    const requestUrl = new URL(url);
    const headers = {};

    if (auth?.username && auth?.password) {
      const credentials = Buffer.from(`${auth.username}:${auth.password}`, 'utf8').toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    const request = https.request(
      requestUrl,
      {
        method: 'GET',
        headers,
        rejectUnauthorized: false,
        timeout: 10000
      },
      (response) => {
        response.resume();
        response.on('end', () => {
          resolvePromise({
            statusCode: response.statusCode ?? 0
          });
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', rejectPromise);
    request.end();
  });
}

function runCommand(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    captureOutput = false,
    allowFailure = false,
    stdio = captureOutput ? 'pipe' : 'inherit'
  } = options;

  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio,
    windowsHide: true
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new Error(`Command not found: ${command}`);
    }
    throw result.error;
  }

  if (!allowFailure && result.status !== 0) {
    throw new Error(`Command failed: ${formatCommand(command, args)}`);
  }

  return result;
}

function sanitizeDetail(value) {
  return value.trim().replace(/\s+/gu, ' ');
}

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

function requireEnvKeys(env, keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required .env values: ${missing.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
