import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCheckoutPayload } from './helpers/test-data';

const CHECKOUT_BASE = process.env.CHECKOUT_API_BASE!;

// ==== POST /api/checkouts ====

test.describe('POST /api/checkouts', () => {
  test(
    '[CO-01] @smoke Given valid checkout payload, when created with authorized credentials, then returns 200 with checkout id and status',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: authHeaders(),
        data: makeCheckoutPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'checkout-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[CO-02] @smoke Given valid checkout payload, when submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: headersWithoutAuth(),
        data: makeCheckoutPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CO-03] @smoke Given valid checkout payload, when submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: headersWithInvalidToken(),
        data: makeCheckoutPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CO-04] @smoke Given empty request body, when checkout creation attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: authHeaders(),
        data: {},
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[CO-05] @extended Given read-only scoped token, when creating checkout, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: headersWithReadOnlyToken(),
        data: makeCheckoutPayload(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[CO-06] @extended Given duplicate idempotency key for an already-created checkout, when checkout creation attempted again, then returns 409 conflict',
    async ({ request }) => {
      test.skip(!process.env.API_IDEMPOTENCY_KEY_CONFLICT, 'Set API_IDEMPOTENCY_KEY_CONFLICT to a pre-used key value in .env to enable');
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: { ...authHeaders(), 'Idempotency-Key': process.env.API_IDEMPOTENCY_KEY_CONFLICT! },
        data: makeCheckoutPayload(),
      });
      expect(response.status()).toBe(409);
    },
  );

  test(
    '[CO-07] @extended Given idempotency key reused with different payload, when checkout creation attempted, then returns 422 unprocessable',
    async ({ request }) => {
      test.skip(!process.env.API_IDEMPOTENCY_KEY_CONFLICT, 'Set API_IDEMPOTENCY_KEY_CONFLICT to a pre-used key value in .env to enable');
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: { ...authHeaders(), 'Idempotency-Key': process.env.API_IDEMPOTENCY_KEY_CONFLICT! },
        data: { ...makeCheckoutPayload(), amount: 99999999 },
      });
      expect(response.status()).toBe(422);
    },
  );
});
