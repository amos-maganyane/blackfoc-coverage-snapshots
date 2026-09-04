import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken, checkoutAuthParams } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_TRANSACTION_ID = process.env.EXISTING_TRANSACTION_ID;

test.describe('GET /payments/:transactionId — Query transaction by transaction ID', () => {

  test('[QTI-01] @extended Given an existing transaction, when queried by transactionId, then returns 200 with transaction details',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_TRANSACTION_ID,
        'Set EXISTING_TRANSACTION_ID in .env to enable — requires a pre-existing transaction ID',
      );

      const authParams = checkoutAuthParams();
      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/payments/${EXISTING_TRANSACTION_ID}`,
        {
          headers: { 'Accept': 'application/json' },
          params: {
            'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user',
            'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
            'authentication.entityId': authParams.entityId,
          },
        },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      validateSchema(body, 'transaction-response.json');
      expect(body).toMatchObject({ id: EXISTING_TRANSACTION_ID });
      expect(duration).toBeLessThan(5000);
    });

  test('[QTI-02] @smoke Given query transaction by ID request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/payments/non-existent-txn-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[QTI-03] @smoke Given query transaction by ID request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/payments/non-existent-txn-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
