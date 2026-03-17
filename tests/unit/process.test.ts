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

  it('prefers the actionable BuildKit line over trailing build-detail metadata', () => {
    expect(
      summarizeFailureDetail({
        stdout: '',
        stderr: '',
        all: [
          'target image-runtime: failed to solve: process "/bin/sh -c python3 -m pip install --no-cache-dir \\"huggingface_hub[hf_transfer]==0.34.6\\"" did not complete successfully: exit code: 1',
          '',
          'View build details: docker-desktop://dashboard/build/default/default/example'
        ].join('\n'),
        shortMessage: 'Command failed with exit code 1: docker compose up -d',
        message: 'Command failed with exit code 1: docker compose up -d'
      })
    ).toBe(
      'target image-runtime: failed to solve: process "/bin/sh -c python3 -m pip install --no-cache-dir \\"huggingface_hub[hf_transfer]==0.34.6\\"" did not complete successfully: exit code: 1'
    );
  });

  it('falls back to the original message when the wrapped message has no useful detail', () => {
    expect(
      summarizeFailureDetail({
        stdout: '',
        stderr: '',
        originalMessage: 'spawn docker ENOENT',
        shortMessage: 'Command failed with exit code 1: docker compose up -d',
        message: 'Command failed with exit code 1: docker compose up -d'
      })
    ).toBe('spawn docker ENOENT');
  });
});
