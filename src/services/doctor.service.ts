import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Listr } from 'listr2';
import { REQUIRED_REPOSITORY_FILES } from '../config/repository-layout.js';
import { createComposeCommandArgs } from '../lib/compose.js';
import type { DoctorCommandOptions } from '../types/cli.types.js';
import type { HostCheckResult, SmokeCheckDefinition } from '../types/doctor.types.js';
import type { ProjectContext, SmokeEnv } from '../types/project.types.js';
import { printCommandHeader } from '../ui/banner.js';
import { printDoctorSummary } from '../ui/logger.js';
import { httpsGet } from '../utils/http.js';
import { runCommand } from '../utils/process.js';
import { parseSmokeEnv } from './project.service.js';

/**
 * Runs host checks and optional smoke checks with a styled summary.
 */
export async function runDoctorCommand(
  context: ProjectContext,
  options: DoctorCommandOptions
): Promise<void> {
  printCommandHeader({
    title: 'Doctor',
    summary: options.smoke
      ? 'Validate host requirements and run smoke checks'
      : 'Validate host requirements for the lab',
    projectRoot: context.projectRoot
  });

  const results: HostCheckResult[] = [];
  const tasks = [
    createCheckTask(results, 'Docker CLI', () => checkCommand('docker', ['--version'], 'Docker CLI')),
    createCheckTask(results, 'Docker Compose v2', () =>
      checkCommand('docker', ['compose', 'version', '--short'], 'Docker Compose v2')
    ),
    createCheckTask(results, 'Docker daemon', () =>
      checkCommand('docker', ['info', '--format', '{{.ServerVersion}}'], 'Docker daemon')
    ),
    createCheckTask(results, 'Node.js', () => Promise.resolve(checkNodeVersion())),
    createCheckTask(results, 'npm', () => checkCommand(...npmCheckCommand())),
    createCheckTask(results, 'Compose configuration', () => checkComposeConfiguration(context)),
    ...REQUIRED_REPOSITORY_FILES.map((relativePath) =>
      createCheckTask(results, `Required file ${relativePath}`, () =>
        Promise.resolve(checkRequiredFile(context.projectRoot, relativePath))
      )
    )
  ];

  if (options.smoke) {
    const env = parseSmokeEnv(context.env);
    for (const smokeCheck of buildSmokeChecks(env)) {
      tasks.push(
        createCheckTask(results, smokeCheck.name, () => runSmokeCheck(smokeCheck))
      );
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
  taskName: string,
  runCheck: () => Promise<HostCheckResult>
) {
  return {
    title: taskName,
    task: async () => {
      const result = await runCheck();
      results.push(result);

      if (!result.ok) {
        throw new Error(result.detail);
      }
    }
  };
}

/**
 * Executes a smoke check against a local HTTPS endpoint.
 */
async function runSmokeCheck(check: SmokeCheckDefinition): Promise<HostCheckResult> {
  try {
    const statusCode = await httpsGet(check.url, check.auth);
    const ok = statusCode >= 200 && statusCode < 400;

    return {
      name: check.name,
      ok,
      detail: `HTTP ${statusCode}`
    };
  } catch (error) {
    return {
      name: check.name,
      ok: false,
      detail: error instanceof Error ? error.message : 'Unknown smoke-check failure'
    };
  }
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
      allowFailure: true
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
async function checkComposeConfiguration(context: ProjectContext): Promise<HostCheckResult> {
  const result = await runCommand('docker', createComposeCommandArgs(context, ['config', '-q']), {
    cwd: context.projectRoot,
    captureOutput: true,
    allowFailure: true
  });

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
function buildSmokeChecks(env: SmokeEnv): SmokeCheckDefinition[] {
  return [
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
}

/**
 * Compresses command output into a single readable line for summaries.
 */
function sanitizeDetail(detail: string): string {
  return detail.trim().replace(/\s+/gu, ' ');
}
