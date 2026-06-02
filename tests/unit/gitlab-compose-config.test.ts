import { readFileSync } from 'node:fs';

describe('GitLab compose configuration', () => {
  it('does not include removed Mattermost Omnibus keys', () => {
    const composeFile = readFileSync('infra/docker/compose.yml', 'utf8');

    expect(composeFile).not.toMatch(/mattermost\[/u);
  });

  it('pins GitLab CE instead of using a floating latest tag', () => {
    const envFile = readFileSync('env/lab.env', 'utf8');

    expect(envFile).not.toMatch(/^GITLAB_VERSION=latest$/mu);
  });
});
