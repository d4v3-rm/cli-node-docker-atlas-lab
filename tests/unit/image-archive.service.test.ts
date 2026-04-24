import { selectAvailableDockerImages } from '../../src/services/archive/image-archive.service.js';
import { normalizeImageReference } from '../../src/services/orchestration/compose-project.service.js';

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

  it('selects only locally available images for archive manifests', () => {
    const selection = selectAvailableDockerImages(
      [
        'cli-node-docker-atlas-lab-gateway:latest',
        'ghcr.io/open-webui/open-webui:v0.8.12',
        'cli-node-docker-atlas-lab-node-dev:latest'
      ],
      new Set([
        'cli-node-docker-atlas-lab-gateway:latest',
        'cli-node-docker-atlas-lab-node-dev:latest'
      ])
    );

    expect(selection.available).toEqual([
      'cli-node-docker-atlas-lab-gateway:latest',
      'cli-node-docker-atlas-lab-node-dev:latest'
    ]);
    expect(selection.missing).toEqual(['ghcr.io/open-webui/open-webui:v0.8.12']);
  });
});
