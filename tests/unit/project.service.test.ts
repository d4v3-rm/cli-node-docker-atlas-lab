import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolvePackagedProjectRoot, resolveProjectRoot } from '../../src/services/project.service.js';

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
      mkdirSync(join(packageRoot, 'config', 'env'), { recursive: true });
      writeFileSync(join(packageRoot, 'infra', 'docker', 'compose.yml'), '');
      writeFileSync(join(packageRoot, 'config', 'env', 'lab.env'), '');

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
});
