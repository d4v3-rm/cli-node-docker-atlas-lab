import { createComposeCommandArgs, resolveComposeFiles } from '../../src/lib/compose.js';
import type { ProjectContext } from '../../src/types/project.types.js';

const context: ProjectContext = {
  env: {},
  layout: {
    composeAiFile: 'infra/docker/compose.ai.yml',
    composeFile: 'infra/docker/compose.yml',
    composeWorkbenchFile: 'infra/docker/compose.workbench.yml',
    envFile: 'config/env/lab.env',
    gatewayAiTemplateFile: 'config/gateway/templates/Caddyfile.ai.template',
    gatewayTemplateFile: 'config/gateway/templates/Caddyfile.template',
    gatewayWorkbenchTemplateFile: 'config/gateway/templates/Caddyfile.workbench.template'
  },
  projectRoot: '/lab'
};

describe('compose lib', () => {
  it('includes only the core compose file by default', () => {
    expect(resolveComposeFiles(context)).toEqual(['infra/docker/compose.yml']);
  });

  it('includes the ai and workbench compose files when requested', () => {
    expect(resolveComposeFiles(context, { includeAi: true, includeWorkbench: true })).toEqual([
      'infra/docker/compose.yml',
      'infra/docker/compose.ai.yml',
      'infra/docker/compose.workbench.yml'
    ]);
  });

  it('can force all compose layers for project-wide commands', () => {
    expect(createComposeCommandArgs(context, ['ps', '--all'], { includeAll: true })).toEqual([
      'compose',
      '--file',
      'infra/docker/compose.yml',
      '--file',
      'infra/docker/compose.ai.yml',
      '--file',
      'infra/docker/compose.workbench.yml',
      '--env-file',
      'config/env/lab.env',
      'ps',
      '--all'
    ]);
  });
});
