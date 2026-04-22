import { classifyN8nOwnerSetupResponse } from '../../src/services/integrations/n8n-owner.service.js';

describe('n8n-owner.service', () => {
  it('marks a successful setup response as created', () => {
    expect(
      classifyN8nOwnerSetupResponse({
        body: '{"data":{}}',
        headers: {},
        statusCode: 200
      })
    ).toBe('created');
  });

  it('detects the already-setup response returned by n8n', () => {
    expect(
      classifyN8nOwnerSetupResponse({
        body: '{"message":"Instance owner already setup"}',
        headers: {},
        statusCode: 400
      })
    ).toBe('already_setup');
  });

  it('keeps other validation errors distinct', () => {
    expect(
      classifyN8nOwnerSetupResponse({
        body: '{"message":"Validation error"}',
        headers: {},
        statusCode: 400
      })
    ).toBe('invalid_payload');
  });
});
