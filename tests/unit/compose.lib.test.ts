import { createComposeCommandArgs, resolveComposeFiles } from '../../src/lib/compose.js';
import type { ProjectContext } from '../../src/types/project.types.js';

const context: ProjectContext = {
  env: {},
  layout: {
    composeAiLlmFile: 'infra/docker/compose.ai-llm.yml',
    composeAiImageFile: 'infra/docker/compose.ai-image.yml',
    composeFile: 'infra/docker/compose.yml',
    composeWorkbenchFile: 'infra/docker/compose.workbench.yml',
    envFile: 'env/lab.env',
    gatewayAiImageTemplateFile: 'config/gateway/templates/Caddyfile.ai-image.template',
    gatewayAiLlmTemplateFile: 'config/gateway/templates/Caddyfile.ai-llm.template',
    gatewayTemplateFile: 'config/gateway/templates/Caddyfile.template',
    gatewayWorkbenchTemplateFile: 'config/gateway/templates/Caddyfile.workbench.template'
  },
  projectRoot: '/lab',
  runtimeSource: 'checkout',
  workingDirectory: '/lab'
};

describe('compose lib', () => {
  it('includes only the core compose file by default', () => {
    expect(resolveComposeFiles(context)).toEqual(['infra/docker/compose.yml']);
  });

  it('includes the ai-llm, ai-image, and workbench compose files when requested', () => {
    expect(
      resolveComposeFiles(context, {
        includeAiImage: true,
        includeAiLlm: true,
        includeWorkbench: true
      })
    ).toEqual([
      'infra/docker/compose.yml',
      'infra/docker/compose.ai-llm.yml',
      'infra/docker/compose.ai-image.yml',
      'infra/docker/compose.workbench.yml'
    ]);
  });

  it('can force all compose layers for project-wide commands', () => {
    expect(createComposeCommandArgs(context, ['ps', '--all'], { includeAll: true })).toEqual([
      'compose',
      '--file',
      'infra/docker/compose.yml',
      '--file',
      'infra/docker/compose.ai-llm.yml',
      '--file',
      'infra/docker/compose.ai-image.yml',
      '--file',
      'infra/docker/compose.workbench.yml',
      '--env-file',
      'env/lab.env',
      'ps',
      '--all'
    ]);
  });
});
