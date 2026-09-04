import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCheckoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /checkout — Initiate Checkout', () => {

  test('[CO-01] @smoke Given valid checkout parameters, when checkout is initiated with encoded form data, then returns 200 with result code', async ({ request }) => {
    const start = Date.now();
    const payload = makeCheckoutPayload();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(payload)) {
      params.append(k, String(v));
    }
    const response = await request.post(`${API_BASE}/checkout`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      data: params.toString(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'checkout-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CO-02] @smoke Given checkout request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/checkout`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[CO-03] @smoke Given checkout request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/checkout`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
