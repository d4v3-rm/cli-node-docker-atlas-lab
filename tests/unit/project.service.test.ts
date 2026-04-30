import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  parseBootstrapEnv,
  parseSmokeEnv,
  parseWorkbenchSmokeEnv,
  resolvePackagedProjectRoot,
  resolveProjectRoot
} from '../../src/services/runtime/project.service.js';

describe('project.service', () => {
  it('resolves the packaged asset root from the bundled entrypoint location', () => {
    const packageRoot = mkdtempSync(join(tmpdir(), 'atlas-lab-package-'));

    try {
      mkdirSync(join(packageRoot, 'dist', 'bin'), { recursive: true });

      const bundledEntrypoint = pathToFileURL(join(packageRoot, 'dist', 'bin', 'atlas-lab.js')).href;

      expect(resolvePackagedProjectRoot(bundledEntrypoint)).toBe(packageRoot);
    } finally {
      rmSync(packageRoot, { force: true, recursive: true });
    }
  });

  it('falls back to the packaged asset root when the cwd is not a lab checkout', () => {
    const packageRoot = mkdtempSync(join(tmpdir(), 'atlas-lab-package-'));
    const randomDirectory = mkdtempSync(join(tmpdir(), 'atlas-lab-cwd-'));

    try {
      mkdirSync(join(packageRoot, 'infra', 'docker'), { recursive: true });
      mkdirSync(join(packageRoot, 'env'), { recursive: true });
      writeFileSync(join(packageRoot, 'infra', 'docker', 'compose.yml'), '');
      writeFileSync(join(packageRoot, 'env', 'lab.env'), '');

      const resolution = resolveProjectRoot(undefined, randomDirectory, packageRoot);

      expect(resolution).toEqual({
        projectRoot: packageRoot,
        runtimeSource: 'packaged-install'
      });
    } finally {
      rmSync(packageRoot, { force: true, recursive: true });
      rmSync(randomDirectory, { force: true, recursive: true });
    }
  });

  it('validates the required workbench smoke env values', () => {
    expect(
      parseWorkbenchSmokeEnv({
        NODE_DEV_PASSWORD: 'RootNodeDev!2026',
        NODE_DEV_URL: 'https://localhost:8450/',
        POSTGRES_DEV_DATABASE: 'lab',
        POSTGRES_DEV_HOST_PORT: '15432',
        POSTGRES_DEV_PASSWORD: 'RootPostgresDev!2026',
        POSTGRES_DEV_SUPERUSER: 'postgres',
        PYTHON_DEV_PASSWORD: 'RootPythonDev!2026',
        PYTHON_DEV_URL: 'https://localhost:8451/'
      })
    ).toMatchObject({
      NODE_DEV_URL: 'https://localhost:8450/',
      PYTHON_DEV_URL: 'https://localhost:8451/',
      POSTGRES_DEV_HOST_PORT: '15432'
    });

    expect(() => parseWorkbenchSmokeEnv({})).toThrow(/NODE_DEV_URL/u);
  });

  it('validates the required BookStack bootstrap env values', () => {
    expect(
      parseBootstrapEnv({
        BOOKSTACK_ROOT_EMAIL: 'root@bookstack.local',
        BOOKSTACK_ROOT_NAME: 'Root Librarian',
        BOOKSTACK_ROOT_PASSWORD: 'RootBookStack!2026',
        GITLAB_ROOT_EMAIL: 'root@gitlab.local',
        GITLAB_ROOT_PASSWORD: 'Qv7N4pL9xT2rB6Z8',
        GITLAB_ROOT_USERNAME: 'root',
        PENPOT_ROOT_EMAIL: 'root@penpot.local',
        PENPOT_ROOT_NAME: 'Root Designer',
        PENPOT_ROOT_PASSWORD: 'RootPenpot!2026'
      })
    ).toMatchObject({
      BOOKSTACK_ROOT_EMAIL: 'root@bookstack.local',
      BOOKSTACK_ROOT_NAME: 'Root Librarian'
    });

    expect(() =>
      parseBootstrapEnv({
        GITLAB_ROOT_EMAIL: 'root@gitlab.local',
        GITLAB_ROOT_PASSWORD: 'Qv7N4pL9xT2rB6Z8',
        GITLAB_ROOT_USERNAME: 'root',
        PENPOT_ROOT_EMAIL: 'root@penpot.local',
        PENPOT_ROOT_NAME: 'Root Designer',
        PENPOT_ROOT_PASSWORD: 'RootPenpot!2026'
      })
    ).toThrow(/BOOKSTACK_ROOT_NAME/u);
  });

  it('validates the required BookStack smoke env value', () => {
    expect(
      parseSmokeEnv({
        BOOKSTACK_URL: 'https://localhost:8452/',
        GITLAB_URL: 'https://localhost:8444/',
        LAB_URL: 'https://localhost:8443/',
        PENPOT_URL: 'https://localhost:8448/'
      })
    ).toMatchObject({
      BOOKSTACK_URL: 'https://localhost:8452/'
    });

    expect(() =>
      parseSmokeEnv({
        GITLAB_URL: 'https://localhost:8444/',
        LAB_URL: 'https://localhost:8443/',
        PENPOT_URL: 'https://localhost:8448/'
      })
    ).toThrow(/BOOKSTACK_URL/u);
  });
});
