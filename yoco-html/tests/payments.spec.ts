import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_PAYMENT_ID = process.env.EXISTING_PAYMENT_ID;

// ==== GET /v1/payments ====

test.describe('GET /v1/payments', () => {
  test(
    '[PAY-01] @smoke Given authorized credentials, when listing payments, then returns 200 with payments list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/payments`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payments-list-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );

  test(
    '[PAY-02] @smoke Given no authorization, when listing payments, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payments`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PAY-03] @smoke Given invalid token, when listing payments, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payments`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PAY-04] @smoke Given invalid query parameter, when listing payments, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payments?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[PAY-05] @extended Given read-only scoped token, when listing payments, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/payments`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PAY-06] @extended Given throttled environment, when listing payments, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/payments`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/payments/:payment_id ====

test.describe('GET /v1/payments/:payment_id', () => {
  test(
    '[PAYF-01] @extended Given existing payment, when fetched by ID, then returns 200 with payment details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_PAYMENT_ID, 'Set EXISTING_PAYMENT_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/payments/${EXISTING_PAYMENT_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payment-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_PAYMENT_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[PAYF-02] @smoke Given non-existent payment ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payments/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[PAYF-03] @smoke Given payment ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payments/some-payment-id`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PAYF-04] @smoke Given payment ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payments/some-payment-id`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PAYF-05] @extended Given read-only scoped token, when fetching payment by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/payments/some-payment-id`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PAYF-06] @extended Given throttled environment, when fetching payment by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/payments/some-payment-id`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});
