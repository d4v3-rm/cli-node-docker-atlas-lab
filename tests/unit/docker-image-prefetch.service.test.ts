import {
  listDockerHubImageSourceCandidates,
  normalizeDockerHubRepositoryPath,
  parseDockerHubMirrorHosts,
  parseRegistryProxyHosts
} from '../../src/services/orchestration/docker-image-prefetch.service.js';

describe('docker-image-prefetch.service', () => {
  it('normalizes Docker Hub shorthand references to their repository paths', () => {
    expect(normalizeDockerHubRepositoryPath('postgres:15')).toBe('library/postgres:15');
    expect(normalizeDockerHubRepositoryPath('gitea/gitea:1.25.5')).toBe('gitea/gitea:1.25.5');
    expect(normalizeDockerHubRepositoryPath('docker.io/library/postgres:15')).toBe(
      'library/postgres:15'
    );
  });

  it('does not treat non-Docker Hub registries as mirrorable Docker Hub images', () => {
    expect(normalizeDockerHubRepositoryPath('ghcr.io/open-webui/open-webui:v0.8.12')).toBeNull();
    expect(normalizeDockerHubRepositoryPath('quay.io/minio/minio:latest')).toBeNull();
  });

  it('builds ordered mirror candidates before the original Docker Hub reference', () => {
    expect(
      listDockerHubImageSourceCandidates('postgres:15', ['mirror.gcr.io', 'docker.1ms.run'])
    ).toEqual([
      'mirror.gcr.io/library/postgres:15',
      'docker.1ms.run/library/postgres:15',
      'postgres:15'
    ]);
  });

  it('parses mirror hosts from env-style csv values and strips protocols', () => {
    expect(
      parseDockerHubMirrorHosts('https://mirror.gcr.io, docker.1ms.run/ ,docker.m.daocloud.io')
    ).toEqual(['mirror.gcr.io', 'docker.1ms.run', 'docker.m.daocloud.io']);
  });

  it('parses generic registry proxies from env-style csv values', () => {
    expect(parseRegistryProxyHosts('https://docker.m.daocloud.io/')).toEqual([
      'docker.m.daocloud.io'
    ]);
  });
});
