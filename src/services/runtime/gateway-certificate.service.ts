import { createComposeCommandArgs } from '../../lib/compose.js';
import type { ProjectContext } from '../../types/project.types.js';
import { runCommand } from '../../utils/process.js';

const GATEWAY_CERT_PATH = '/etc/caddy/certs/lab.crt';

/**
 * Reads the active gateway TLS certificate so smoke checks can verify HTTPS without skipping trust.
 */
export async function readGatewayCertificate(
  context: ProjectContext,
  scope: 'bootstrap' | 'smoke'
): Promise<string> {
  const result = await runCommand(
    'docker',
    createComposeCommandArgs(context, ['exec', '-T', 'gateway', 'cat', GATEWAY_CERT_PATH]),
    {
      allowFailure: true,
      captureOutput: true,
      cwd: context.projectRoot,
      scope
    }
  );

  if (result.exitCode !== 0 || !result.stdout.includes('BEGIN CERTIFICATE')) {
    throw new Error('Could not read the active Atlas Lab gateway certificate.');
  }

  return result.stdout;
}
