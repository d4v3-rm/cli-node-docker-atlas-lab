import { summarizeFailureDetail } from '../../src/utils/process.js';

describe('process failure formatting', () => {
  it('prefers actionable stdout lines when stderr is empty', () => {
    expect(
      summarizeFailureDetail({
        stdout: [
          '[+] up 2/2',
          'Error response from daemon: failed to resolve reference "ghcr.io/example/image:bad": not found'
        ].join('\n'),
        stderr: '',
        shortMessage: 'Command failed with exit code 1: docker compose up -d',
        message: 'Command failed with exit code 1: docker compose up -d'
      })
    ).toBe('Error response from daemon: failed to resolve reference "ghcr.io/example/image:bad": not found');
  });

  it('unwraps nested command failures instead of repeating the command text', () => {
    expect(
      summarizeFailureDetail({
        stdout: '',
        stderr: '',
        shortMessage:
          'Command failed with exit code 1: docker compose up -d | failed to resolve reference "ghcr.io/example/image:bad": not found',
        message:
          'Command failed with exit code 1: docker compose up -d | failed to resolve reference "ghcr.io/example/image:bad": not found'
      })
    ).toBe('failed to resolve reference "ghcr.io/example/image:bad": not found');
  });
});
