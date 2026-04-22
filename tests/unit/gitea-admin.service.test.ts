import { parseGiteaUsernames } from '../../src/services/integrations/gitea-admin.service.js';

describe('gitea-admin.service', () => {
  it('extracts exact usernames from the gitea admin list table', () => {
    const stdout = [
      'ID   Username Email            IsActive IsAdmin 2FA',
      '1    root     root@gitea.local true     true    false',
      '2    root2    root2@gitea.local true    false   false'
    ].join('\n');

    expect(parseGiteaUsernames(stdout)).toEqual(['root', 'root2']);
  });
});
