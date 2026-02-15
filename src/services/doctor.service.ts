import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Listr } from 'listr2';
import { REQUIRED_REPOSITORY_FILES } from '../config/repository-layout.js';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { DoctorCommandOptions } from '../types/cli.types.js';
import type { HostCheckResult, SmokeCheckDefinition } from '../types/doctor.types.js';
import type { AiSmokeEnv, ProjectContext, SmokeEnv } from '../types/project.types.js';
import { printCommandHeader } from '../ui/banner.js';
import { formatTaskTitle, printDoctorSummary } from '../ui/logger.js';
import { requestHttps } from '../utils/http.js';
import { runCommand } from '../utils/process.js';
import { readGatewayCertificate } from './gateway-certificate.service.js';
import { checkNvidiaGpuRuntime } from './gpu-preflight.service.js';
import { canLoginToN8n } from './n8n-owner.service.js';
import { parseAiSmokeEnv, parseSmokeEnv } from './project.service.js';

/**
 * Runs host checks and optional smoke checks with a styled summary.
 */
export async function runDoctorCommand(
  context: ProjectContext,
  options: DoctorCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Atlas Lab Doctor',
    summary: options.smoke
      ? 'Validate host requirements and run smoke checks'
      : 'Validate host requirements for Atlas Lab',
    projectRoot: context.projectRoot
  });

  const results: HostCheckResult[] = [];
  const tasks = [
    createCheckTask(results, 'host', 'Docker CLI', () => checkCommand('docker', ['--version'], 'Docker CLI')),
    createCheckTask(results, 'host', 'Docker Compose v2', () =>
      checkCommand('docker', ['compose', 'version', '--short'], 'Docker Compose v2')
    ),
    createCheckTask(results, 'host', 'Docker daemon', () =>
      checkCommand('docker', ['info', '--format', '{{.ServerVersion}}'], 'Docker daemon')
    ),
    ...(options.withAi
      ? [createCheckTask(results, 'host', 'NVIDIA GPU', () => checkNvidiaGpuRuntime())]
      : []),
    createCheckTask(results, 'host', 'Node.js', () => Promise.resolve(checkNodeVersion())),
    createCheckTask(results, 'host', 'npm', () => checkCommand(...npmCheckCommand())),
    createCheckTask(results, 'doctor', 'Compose configuration', () =>
      checkComposeConfiguration(context, options)
    ),
    ...REQUIRED_REPOSITORY_FILES.map((relativePath) =>
      createCheckTask(results, 'doctor', `Required file ${relativePath}`, () =>
        Promise.resolve(checkRequiredFile(context.projectRoot, relativePath))
      )
    )
  ];

  if (options.smoke) {
    const env = parseSmokeEnv(context.env);
    const aiEnv = options.withAi ? parseAiSmokeEnv(context.env) : undefined;
    const gatewayCertificate = await readGatewayCertificate(context, 'smoke');
    for (const smokeCheck of buildSmokeChecks(env, aiEnv)) {
      tasks.push(createCheckTask(results, 'smoke', smokeCheck.name, () => smokeCheck.run(gatewayCertificate)));
    }
  }

  const taskList = new Listr(tasks, {
    concurrent: false,
    exitOnError: false
  });

  await taskList.run().catch(() => undefined);

  printDoctorSummary(results);

  const failedChecks = results.filter((result) => !result.ok).length;
  if (failedChecks > 0) {
    throw new Error(`Doctor found ${failedChecks} issue(s).`);
  }
}

/**
 * Creates a Listr task that stores the result and surfaces the detail on failure.
 */
function createCheckTask(
  results: HostCheckResult[],
  scope: 'doctor' | 'host' | 'smoke',
  taskName: string,
  runCheck: () => Promise<HostCheckResult>
) {
  return {
    title: formatTaskTitle(scope, taskName),
    task: async () => {
      let result: HostCheckResult;

      try {
        result = await runCheck();
      } catch (error) {
        result = {
          name: taskName,
          ok: false,
          detail: error instanceof Error ? error.message : 'Unknown diagnostic failure'
        };
      }

      results.push(result);

      if (!result.ok) {
        throw new Error(result.detail);
      }
    }
  };
}

/**
 * Wraps a command-based host check and normalizes its result.
 */
async function checkCommand(
  command: string,
  args: string[],
  name: string
): Promise<HostCheckResult> {
  try {
    const result = await runCommand(command, args, {
      captureOutput: true,
      allowFailure: true,
      scope: 'host'
    });

    return {
      name,
      ok: result.exitCode === 0,
      detail: sanitizeDetail(result.stderr || result.stdout)
    };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : 'Unknown command failure'
    };
  }
}

/**
 * Validates the local Node.js runtime against the minimum supported major version.
 */
function checkNodeVersion(): HostCheckResult {
  const version = process.versions.node;
  const majorVersion = Number.parseInt(version.split('.')[0] ?? '0', 10);

  if (Number.isNaN(majorVersion) || majorVersion < 20) {
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
}

/**
 * Returns the best npm invocation for the current platform.
 */
function npmCheckCommand(): [string, string[], string] {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', '--version'], 'npm'];
  }

  return ['npm', ['--version'], 'npm'];
}

/**
 * Checks that the resolved Compose entrypoint parses successfully for the checkout.
 */
async function checkComposeConfiguration(
  context: ProjectContext,
  options: Pick<DoctorCommandOptions, 'withAi' | 'withWorkbench'>
): Promise<HostCheckResult> {
  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, ['config', '-q'], {
      includeAi: Boolean(options.withAi),
      includeWorkbench: Boolean(options.withWorkbench)
    }),
    {
      cwd: context.projectRoot,
      captureOutput: true,
      allowFailure: true,
      scope: 'doctor'
    }
  );

  return {
    name: 'Compose configuration',
    ok: result.exitCode === 0,
    detail:
      result.exitCode === 0
        ? 'infra/docker/compose.yml parsed successfully'
        : sanitizeDetail(result.stderr || result.stdout)
  };
}

/**
 * Checks whether a required repository file exists.
 */
function checkRequiredFile(projectRoot: string, relativePath: string): HostCheckResult {
  const fullPath = join(projectRoot, relativePath);

  return {
    name: `Required file ${relativePath}`,
    ok: existsSync(fullPath),
    detail: fullPath
  };
}

/**
 * Builds the smoke-check definitions from the validated lab env values.
 */
function buildSmokeChecks(env: SmokeEnv, aiEnv?: AiSmokeEnv): SmokeCheckDefinition[] {
  const checks: SmokeCheckDefinition[] = [
    {
      name: 'Smoke deck',
      run: (caCertificate) => runStatusCheck('Smoke deck', env.LAB_URL, caCertificate)
    },
    {
      name: 'Smoke Gitea',
      run: (caCertificate) =>
        runStatusCheck('Smoke Gitea', new URL('/api/healthz', env.GITEA_URL).toString(), caCertificate)
    },
    {
      name: 'Smoke n8n',
      run: async (caCertificate) => {
        const ok = await canLoginToN8n(env, caCertificate);

        return {
          name: 'Smoke n8n',
          ok,
          detail: ok ? 'Owner login verified' : 'Could not authenticate with the configured owner account'
        };
      }
    }
  ];

  if (!aiEnv) {
    return checks;
  }

  checks.push(
    {
      name: 'Smoke Open WebUI',
      run: async (caCertificate) => {
        const signInResponse = await requestHttps(
          new URL('/api/v1/auths/signin', aiEnv.OPENWEBUI_URL).toString(),
          {
            body: JSON.stringify({
              email: aiEnv.OPENWEBUI_ROOT_EMAIL,
              password: aiEnv.OPENWEBUI_ROOT_PASSWORD
            }),
            caCertificate,
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST'
          }
        );

        if (signInResponse.statusCode !== 200) {
          return {
            name: 'Smoke Open WebUI',
            ok: false,
            detail: `Sign-in failed with HTTP ${signInResponse.statusCode}`
          };
        }

        const token = parseJson<{ token?: string }>(signInResponse.body).token;
        if (!token) {
          return {
            name: 'Smoke Open WebUI',
            ok: false,
            detail: 'Sign-in succeeded but no bearer token was returned'
          };
        }

        const modelsResponse = await requestHttps(
          new URL('/api/models', aiEnv.OPENWEBUI_URL).toString(),
          {
            caCertificate,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const modelIds = collectModelIdentifiers(modelsResponse.body);
        const missingModels = [aiEnv.OLLAMA_CHAT_MODEL, `${aiEnv.OLLAMA_EMBEDDING_MODEL}:latest`].filter(
          (modelName) => !modelIds.includes(modelName)
        );

        return {
          name: 'Smoke Open WebUI',
          ok: modelsResponse.statusCode === 200 && missingModels.length === 0,
          detail:
            missingModels.length === 0
              ? `Authenticated and listed ${modelIds.length} models`
              : `Missing models in Open WebUI: ${missingModels.join(', ')}`
        };
      }
    },
    {
      name: 'Smoke Ollama',
      run: async (caCertificate) => {
        const response = await requestHttps(new URL('/api/tags', aiEnv.OLLAMA_URL).toString(), {
          auth: {
            username: aiEnv.OLLAMA_GATEWAY_USER,
            password: aiEnv.OLLAMA_GATEWAY_PASSWORD
          },
          caCertificate
        });

        const modelIds = collectOllamaModelIdentifiers(response.body);
        const missingModels = [aiEnv.OLLAMA_CHAT_MODEL, `${aiEnv.OLLAMA_EMBEDDING_MODEL}:latest`].filter(
          (modelName) => !modelIds.includes(modelName)
        );

        return {
          name: 'Smoke Ollama',
          ok: response.statusCode === 200 && missingModels.length === 0,
          detail:
            missingModels.length === 0
              ? `Gateway auth verified with ${modelIds.length} local models`
              : `Missing models in Ollama: ${missingModels.join(', ')}`
        };
      }
    }
  );

  return checks;
}

/**
 * Compresses command output into a single readable line for summaries.
 */
function sanitizeDetail(detail: string): string {
  return detail.trim().replace(/\s+/gu, ' ');
}

/**
 * Executes a status-based smoke check against an HTTPS endpoint.
 */
async function runStatusCheck(
  name: string,
  url: string,
  caCertificate: string
): Promise<HostCheckResult> {
  try {
    const response = await requestHttps(url, { caCertificate });

    return {
      name,
      ok: response.statusCode >= 200 && response.statusCode < 400,
      detail: `HTTP ${response.statusCode}`
    };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : 'Unknown smoke-check failure'
    };
  }
}

/**
 * Parses a JSON response body and throws a readable error when the payload is invalid.
 */
function parseJson<TValue>(body: string): TValue {
  return JSON.parse(body) as TValue;
}

/**
 * Extracts model identifiers from the Open WebUI `/api/models` payload.
 */
function collectModelIdentifiers(body: string): string[] {
  const payload = parseJson<{ data?: Array<{ id?: string }> }>(body);
  return (payload.data ?? []).flatMap((entry) => (entry.id ? [entry.id] : []));
}

/**
 * Extracts model identifiers from the Ollama `/api/tags` payload.
 */
function collectOllamaModelIdentifiers(body: string): string[] {
  const payload = parseJson<{ models?: Array<{ name?: string }> }>(body);
  return (payload.models ?? []).flatMap((entry) => (entry.name ? [entry.name] : []));
}
