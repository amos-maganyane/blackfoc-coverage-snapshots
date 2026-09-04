import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeV2CheckoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /v2/checkout/validate — Validate Checkout request v2', () => {

  test('[V2V-01] @smoke Given valid v2 checkout parameters, when validation is requested, then returns 200 with validation result', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/v2/checkout/validate`, {
      headers: authHeaders(),
      data: makeV2CheckoutPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'v2-checkout-validate-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[V2V-02] @smoke Given v2 checkout validate request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v2/checkout/validate`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[V2V-03] @smoke Given v2 checkout validate request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v2/checkout/validate`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
