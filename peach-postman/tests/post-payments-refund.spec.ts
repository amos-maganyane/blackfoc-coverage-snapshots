import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeRefundPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const EXISTING_TRANSACTION_ID = process.env.EXISTING_TRANSACTION_ID;

test.describe('POST /payments/:transactionId — Refund transaction', () => {

  test('[RF-01] @extended Given an existing successful transaction, when a refund is submitted, then returns 200 with refund transaction result',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_TRANSACTION_ID,
        'Set EXISTING_TRANSACTION_ID in .env to enable — requires a refundable transaction',
      );

      const payload = makeRefundPayload();
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(payload)) {
        params.append(k, String(v));
      }

      const start = Date.now();
      const response = await request.post(
        `${API_BASE}/payments/${EXISTING_TRANSACTION_ID}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
          data: params.toString(),
        },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      validateSchema(body, 'payment-response.json');
      expect(duration).toBeLessThan(5000);
    });

  test('[RF-02] @smoke Given refund request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/payments/non-existent-id`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[RF-03] @smoke Given refund request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/payments/non-existent-id`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
