import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { httpsGet } from '../lib/http.mjs';
import { requireEnvKeys } from '../lib/project.mjs';
import { checkCommand, checkNodeVersion, npmCheckCommand, runCommand } from '../lib/system.mjs';

const REQUIRED_FILES = ['docker-compose.yml', '.env', 'gateway/templates/Caddyfile.template'];
const SMOKE_ENV_KEYS = [
  'LAB_URL',
  'GITEA_URL',
  'N8N_URL',
  'OPENWEBUI_URL',
  'OLLAMA_URL',
  'N8N_GATEWAY_USER',
  'N8N_GATEWAY_PASSWORD',
  'OLLAMA_GATEWAY_USER',
  'OLLAMA_GATEWAY_PASSWORD'
];

export async function commandDoctor(projectRoot, env, options) {
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
        detail: result.stderr || result.stdout
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
  return REQUIRED_FILES.map((relativePath) => {
    const fullPath = join(projectRoot, relativePath);
    return {
      name: `Required file ${relativePath}`,
      ok: existsSync(fullPath),
      detail: fullPath
    };
  });
}

async function runSmokeChecks(env) {
  requireEnvKeys(env, SMOKE_ENV_KEYS);

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
