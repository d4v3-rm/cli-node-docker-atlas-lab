import { requireEnvKeys } from '../lib/project.mjs';
import { runCommand, sleep } from '../lib/system.mjs';

const GITEA_CONFIG = '/data/gitea/conf/app.ini';
const BOOTSTRAP_ENV_KEYS = [
  'GITEA_UID',
  'GITEA_GID',
  'GITEA_ROOT_USERNAME',
  'GITEA_ROOT_PASSWORD',
  'GITEA_ROOT_EMAIL',
  'OLLAMA_EMBEDDING_MODEL'
];

export async function commandBootstrap(projectRoot, env, options) {
  requireEnvKeys(env, BOOTSTRAP_ENV_KEYS);

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
