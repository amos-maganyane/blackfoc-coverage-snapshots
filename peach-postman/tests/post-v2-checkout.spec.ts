import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeV2CheckoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /v2/checkout — Generate Checkout ID', () => {

  test('[V2C-01] @smoke Given valid checkout parameters, when checkout ID is generated, then returns 200 with checkout ID', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/v2/checkout`, {
      headers: authHeaders(),
      data: makeV2CheckoutPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'v2-checkout-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[V2C-02] @smoke Given v2 checkout request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v2/checkout`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[V2C-03] @smoke Given v2 checkout request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v2/checkout`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
