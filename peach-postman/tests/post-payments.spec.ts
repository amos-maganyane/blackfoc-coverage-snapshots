import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /payments — Create payment (direct integration)', () => {

  test('[PY-01] @smoke Given valid payment credentials and card data, when a payment is created, then returns 200 with transaction result', async ({ request }) => {
    const start = Date.now();
    const payload = makePaymentPayload();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(payload)) {
      params.append(k, String(v));
    }
    const response = await request.post(`${API_BASE}/payments`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      data: params.toString(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payment-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[PY-02] @smoke Given payment request, when submitted without authorization parameters, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/payments`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[PY-03] @smoke Given payment request, when submitted with invalid credentials, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/payments`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
