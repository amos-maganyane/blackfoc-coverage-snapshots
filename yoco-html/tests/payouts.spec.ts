import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_PAYOUT_ID = process.env.EXISTING_PAYOUT_ID;

// ==== GET /v1/payouts ====

test.describe('GET /v1/payouts', () => {
  test(
    '[PYT-01] @smoke Given authorized credentials, when listing payouts, then returns 200 with payouts list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/payouts`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payouts-list-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );

  test(
    '[PYT-02] @smoke Given no authorization, when listing payouts, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payouts`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PYT-03] @smoke Given invalid token, when listing payouts, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payouts`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PYT-04] @smoke Given invalid query parameter, when listing payouts, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payouts?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[PYT-05] @extended Given read-only scoped token, when listing payouts, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/payouts`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PYT-06] @extended Given throttled environment, when listing payouts, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/payouts`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/payouts/:payout_id ====

test.describe('GET /v1/payouts/:payout_id', () => {
  test(
    '[PYTF-01] @extended Given existing payout, when fetched by ID, then returns 200 with payout details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_PAYOUT_ID, 'Set EXISTING_PAYOUT_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/payouts/${EXISTING_PAYOUT_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payout-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_PAYOUT_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[PYTF-02] @smoke Given non-existent payout ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[PYTF-03] @smoke Given payout ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PYTF-04] @smoke Given payout ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PYTF-05] @extended Given read-only scoped token, when fetching payout by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PYTF-06] @extended Given throttled environment, when fetching payout by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/payouts/:payout_id/payout_entries ====

test.describe('GET /v1/payouts/:payout_id/payout_entries', () => {
  test(
    '[PYTE-01] @extended Given existing payout, when listing its payout entries, then returns 200 with entries list',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_PAYOUT_ID, 'Set EXISTING_PAYOUT_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/payouts/${EXISTING_PAYOUT_ID}/payout_entries`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payout-entries-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );

  test(
    '[PYTE-02] @smoke Given non-existent payout ID, when listing payout entries, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/non-existent-id-99999/payout_entries`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[PYTE-03] @smoke Given payout ID, when listing payout entries without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id/payout_entries`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PYTE-04] @smoke Given payout ID, when listing payout entries with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id/payout_entries`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PYTE-05] @smoke Given invalid query parameter, when listing payout entries, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id/payout_entries?limit=not-a-number`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[PYTE-06] @extended Given read-only scoped token, when listing payout entries, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id/payout_entries`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PYTE-07] @extended Given throttled environment, when listing payout entries, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/payouts/some-payout-id/payout_entries`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
