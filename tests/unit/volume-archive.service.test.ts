import type { VolumeArchiveManifest } from '../../src/types/docker.types.js';

describe('volume archive manifest', () => {
  it('represents archived volumes with logical and docker names', () => {
    const manifest: VolumeArchiveManifest = {
      createdAt: '2026-03-09T00:00:00.000Z',
      project: '/lab',
      volumes: [
        {
          archiveFile: 'gateway-data.tar',
          dockerName: 'cli-node-docker-atlas-lab_gateway-data',
          logicalName: 'gateway-data'
        }
      ]
    };

    expect(manifest.volumes[0]?.logicalName).toBe('gateway-data');
    expect(manifest.volumes[0]?.dockerName).toBe('cli-node-docker-atlas-lab_gateway-data');
  });
});
