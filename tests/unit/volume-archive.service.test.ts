import type { VolumeArchiveManifest } from '../../src/types/docker.types.js';
import { selectExistingDockerVolumes } from '../../src/services/archive/volume-archive.service.js';

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

  it('selects only existing volumes for archive manifests', () => {
    const volumes = [
      {
        archiveFile: 'gateway-data.tar',
        dockerName: 'cli-node-docker-atlas-lab_gateway-data',
        logicalName: 'gateway-data'
      },
      {
        archiveFile: 'open-webui-data.tar',
        dockerName: 'cli-node-docker-atlas-lab_open-webui-data',
        logicalName: 'open-webui-data'
      },
      {
        archiveFile: 'node-dev-home.tar',
        dockerName: 'cli-node-docker-atlas-lab_node-dev-home',
        logicalName: 'node-dev-home'
      }
    ];

    const selection = selectExistingDockerVolumes(
      volumes,
      new Set(['cli-node-docker-atlas-lab_gateway-data', 'cli-node-docker-atlas-lab_node-dev-home'])
    );

    expect(selection.available.map((volume) => volume.logicalName)).toEqual([
      'gateway-data',
      'node-dev-home'
    ]);
    expect(selection.missing.map((volume) => volume.logicalName)).toEqual(['open-webui-data']);
  });
});
