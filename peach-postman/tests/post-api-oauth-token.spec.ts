import { test, expect } from '@playwright/test';
import { baseHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeOAuthTokenPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /api/oauth/token — Merchant Access (OAuth2 token)', () => {

  test('[OA-01] @smoke Given valid client credentials, when OAuth token is requested, then returns 200 with access_token', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/api/oauth/token`, {
      headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
      data: makeOAuthTokenPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'oauth-token-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[OA-02] @smoke Given invalid client credentials, when OAuth token is requested, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/oauth/token`, {
      headers: baseHeaders(),
      data: { clientId: 'invalid-id', clientSecret: 'invalid-secret', grantType: 'client_credentials' },
    });
    expect(response.status()).toBe(401);
  });

  test('[OA-03] @smoke Given empty body, when OAuth token is requested, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/oauth/token`, {
      headers: baseHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});
