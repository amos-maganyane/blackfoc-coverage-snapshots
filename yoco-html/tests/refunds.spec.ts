import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_REFUND_ID = process.env.EXISTING_REFUND_ID;

// ==== GET /v1/refunds ====

test.describe('GET /v1/refunds', () => {
  test(
    '[REF-01] @smoke Given authorized credentials, when listing refunds, then returns 200 with refunds list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/refunds`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'yoco-refunds-list-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );

  test(
    '[REF-02] @smoke Given no authorization, when listing refunds, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/refunds`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[REF-03] @smoke Given invalid token, when listing refunds, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/refunds`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[REF-04] @smoke Given invalid query parameter, when listing refunds, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/refunds?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[REF-05] @extended Given read-only scoped token, when listing refunds, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/refunds`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[REF-06] @extended Given throttled environment, when listing refunds, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/refunds`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/refunds/:refund_id ====

test.describe('GET /v1/refunds/:refund_id', () => {
  test(
    '[REFF-01] @extended Given existing refund, when fetched by ID, then returns 200 with refund details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_REFUND_ID, 'Set EXISTING_REFUND_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/refunds/${EXISTING_REFUND_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'yoco-refund-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_REFUND_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[REFF-02] @smoke Given non-existent refund ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/refunds/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[REFF-03] @smoke Given refund ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/refunds/some-refund-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[REFF-04] @smoke Given refund ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/refunds/some-refund-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[REFF-05] @extended Given read-only scoped token, when fetching refund by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/refunds/some-refund-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[REFF-06] @extended Given throttled environment, when fetching refund by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/refunds/some-refund-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
