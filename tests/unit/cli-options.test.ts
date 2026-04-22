import { normalizeAiAliasOptions } from '../../src/utils/cli-options.js';

describe('cli option normalization', () => {
  it('maps legacy Commander alias keys to the canonical AI layer flags', () => {
    expect(
      normalizeAiAliasOptions({
        withAi: true,
        withWorkbench: true
      })
    ).toMatchObject({
      withAiLlm: true,
      withWorkbench: true
    });
  });

  it('preserves the canonical AI layer flags when they are already present', () => {
    expect(
      normalizeAiAliasOptions({
        withAiLlm: true
      })
    ).toMatchObject({
      withAiLlm: true
    });
  });
});
