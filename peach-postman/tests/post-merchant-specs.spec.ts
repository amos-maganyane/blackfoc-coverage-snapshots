import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeMerchantSpecsPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /merchant_specs — Retrieve payment methods for a currency', () => {

  test('[MS-01] @smoke Given valid merchant credentials and currency, when payment methods are requested, then returns 200 with payment method list', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/merchant_specs`, {
      headers: authHeaders(),
      data: makeMerchantSpecsPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'merchant-specs-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[MS-02] @smoke Given merchant specs request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/merchant_specs`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[MS-03] @smoke Given merchant specs request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/merchant_specs`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
