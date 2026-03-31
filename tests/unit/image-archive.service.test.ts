import { normalizeImageReference } from '../../src/services/compose-project.service.js';

describe('image archive helpers', () => {
  it('adds :latest when a compose image reference does not include a tag', () => {
    expect(normalizeImageReference('cli-node-docker-atlas-lab-gitea')).toBe(
      'cli-node-docker-atlas-lab-gitea:latest'
    );
  });

  it('preserves explicit tags and digests', () => {
    expect(normalizeImageReference('ghcr.io/open-webui/open-webui:v0.8.8')).toBe(
      'ghcr.io/open-webui/open-webui:v0.8.8'
    );
    expect(normalizeImageReference('repo/image@sha256:deadbeef')).toBe(
      'repo/image@sha256:deadbeef'
    );
  });
});
