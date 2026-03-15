import {
  collectConfiguredOllamaModels,
  collectExpectedOllamaModelIdentifiers
} from '../../src/utils/model-lists.js';

describe('model-lists', () => {
  it('collects runtime, chat, and embedding models without duplicates', () => {
    expect(
      collectConfiguredOllamaModels({
        OLLAMA_RUNTIME_MODELS: 'qwen3.5:9b, qwen3.5:4b, qwen3.5:2b, qwen3.5:0.8b, nomic-embed-text',
        OLLAMA_CHAT_MODEL: 'qwen3.5:4b',
        OLLAMA_EMBEDDING_MODEL: 'nomic-embed-text'
      })
    ).toEqual([
      'qwen3.5:9b',
      'qwen3.5:4b',
      'qwen3.5:2b',
      'qwen3.5:0.8b',
      'nomic-embed-text'
    ]);
  });

  it('falls back to chat and embedding models when no runtime list is configured', () => {
    expect(
      collectConfiguredOllamaModels({
        OLLAMA_CHAT_MODEL: 'qwen3.5:4b',
        OLLAMA_EMBEDDING_MODEL: 'nomic-embed-text'
      })
    ).toEqual(['qwen3.5:4b', 'nomic-embed-text']);
  });

  it('normalizes untagged models to :latest for smoke checks', () => {
    expect(
      collectExpectedOllamaModelIdentifiers({
        OLLAMA_RUNTIME_MODELS: 'qwen3.5:9b, nomic-embed-text',
        OLLAMA_CHAT_MODEL: 'qwen3.5:4b',
        OLLAMA_EMBEDDING_MODEL: 'nomic-embed-text'
      })
    ).toEqual(['qwen3.5:9b', 'nomic-embed-text:latest', 'qwen3.5:4b']);
  });
});
