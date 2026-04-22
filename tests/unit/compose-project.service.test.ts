import {
  collectPublishedPorts,
  parseComposePsEntries
} from '../../src/services/orchestration/compose-project.service.js';

describe('compose-project.service', () => {
  it('parses newline-delimited compose ps output', () => {
    const stdout = [
      JSON.stringify({
        Service: 'gateway',
        Publishers: [
          { PublishedPort: 8443, Protocol: 'tcp' },
          { PublishedPort: 8444, Protocol: 'tcp' }
        ]
      }),
      JSON.stringify({
        Service: 'gateway-workbench',
        Publishers: [{ PublishedPort: 8450, Protocol: 'tcp' }]
      })
    ].join('\n');

    const entries = parseComposePsEntries(stdout);

    expect(entries).toHaveLength(2);
    expect(entries[0]?.Service).toBe('gateway');
    expect(entries[1]?.Service).toBe('gateway-workbench');
  });

  it('collects distinct published host ports', () => {
    const ports = collectPublishedPorts([
      {
        Service: 'gateway',
        Publishers: [
          { PublishedPort: 8443, Protocol: 'tcp' },
          { PublishedPort: 8444, Protocol: 'tcp' },
          { PublishedPort: 8443, Protocol: 'tcp' }
        ]
      }
    ]);

    expect([...ports]).toEqual([8443, 8444]);
  });
});
