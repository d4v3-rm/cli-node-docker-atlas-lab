import { spawnSync } from 'node:child_process';
import process from 'node:process';

export function runCommand(command, args, options = {}) {
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

export function checkCommand(command, args, name) {
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

export function checkNodeVersion() {
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

export function npmCheckCommand() {
  if (process.platform === 'win32') {
    return ['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', '--version'], 'npm'];
  }

  return ['npm', ['--version'], 'npm'];
}

export function sleep(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

function sanitizeDetail(value) {
  return value.trim().replace(/\s+/gu, ' ');
}

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}
