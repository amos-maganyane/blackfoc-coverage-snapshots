import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCheckoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /checkout/initiate — Initiate redirect-based Checkout', () => {

  test('[CI-01] @smoke Given valid checkout parameters, when redirect-based checkout is initiated, then returns 200 with checkout result', async ({ request }) => {
    const start = Date.now();
    const payload = makeCheckoutPayload();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(payload)) {
      params.append(k, String(v));
    }
    const response = await request.post(`${API_BASE}/checkout/initiate`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      data: params.toString(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'checkout-initiate-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CI-02] @smoke Given checkout initiate request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/checkout/initiate`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[CI-03] @smoke Given checkout initiate request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/checkout/initiate`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
