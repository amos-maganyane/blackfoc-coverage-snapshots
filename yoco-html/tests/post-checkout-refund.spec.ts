import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCheckoutPayload, makeRefundPayload } from './helpers/test-data';

const CHECKOUT_BASE = process.env.CHECKOUT_API_BASE!;

// ==== POST /api/checkouts/:id/refund ====

test.describe('POST /api/checkouts/:id/refund', () => {
  test(
    '[CR-01] @smoke Given existing checkout, when refund created with authorized credentials, then returns 200 with refund details',
    async ({ request }) => {
      const createResp = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: authHeaders(),
        data: makeCheckoutPayload(),
      });
      expect(createResp.status()).toBe(200);
      const checkout = await createResp.json() as { id: string };
      const checkoutId = checkout.id;

      const start = Date.now();
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts/${checkoutId}/refund`, {
        headers: authHeaders(),
        data: makeRefundPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'refund-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[CR-02] @smoke Given existing checkout, when refund submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts/ch_test123/refund`, {
        headers: headersWithoutAuth(),
        data: makeRefundPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CR-03] @smoke Given existing checkout, when refund submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts/ch_test123/refund`, {
        headers: headersWithInvalidToken(),
        data: makeRefundPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CR-04] @smoke Given non-existent checkout ID, when refund attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.post(
        `${CHECKOUT_BASE}/api/checkouts/non-existent-id-99999/refund`,
        {
          headers: authHeaders(),
          data: makeRefundPayload(),
        },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[CR-05] @extended Given read-only scoped token, when creating refund, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts/ch_test123/refund`, {
        headers: headersWithReadOnlyToken(),
        data: makeRefundPayload(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[CR-06] @extended Given already-refunded checkout, when refund attempted again, then returns 409 conflict',
    async ({ request }) => {
      test.skip(!process.env.REFUNDED_CHECKOUT_ID, 'Set REFUNDED_CHECKOUT_ID in .env to enable — requires a checkout that has already been fully refunded');
      const response = await request.post(
        `${CHECKOUT_BASE}/api/checkouts/${process.env.REFUNDED_CHECKOUT_ID}/refund`,
        {
          headers: authHeaders(),
          data: makeRefundPayload(),
        },
      );
      expect(response.status()).toBe(409);
    },
  );

  test(
    '[CR-07] @extended Given refund amount exceeding original checkout amount, when refund attempted, then returns 422 unprocessable',
    async ({ request }) => {
      test.skip(!process.env.EXISTING_CHECKOUT_ID, 'Set EXISTING_CHECKOUT_ID in .env to enable — requires a known checkout ID');
      const response = await request.post(
        `${CHECKOUT_BASE}/api/checkouts/${process.env.EXISTING_CHECKOUT_ID}/refund`,
        {
          headers: authHeaders(),
          data: { amount: 999999999 },
        },
      );
      expect(response.status()).toBe(422);
    },
  );
});
