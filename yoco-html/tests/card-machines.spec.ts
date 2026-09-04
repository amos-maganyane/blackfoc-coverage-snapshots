import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_CARD_MACHINE_ID = process.env.EXISTING_CARD_MACHINE_ID;

// ==== GET /v1/card_machines ====

test.describe('GET /v1/card_machines', () => {
  test(
    '[CM-01] @smoke Given authorized credentials, when listing card machines, then returns 200 with card machines list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/card_machines`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'card-machines-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[CM-02] @smoke Given no authorization, when listing card machines, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/card_machines`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CM-03] @smoke Given invalid token, when listing card machines, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/card_machines`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CM-04] @smoke Given invalid query parameter, when listing card machines, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/card_machines?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[CM-05] @extended Given read-only scoped token, when listing card machines, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/card_machines`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[CM-06] @extended Given throttled environment, when listing card machines, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/card_machines`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/card_machines/:card_machine_id ====

test.describe('GET /v1/card_machines/:card_machine_id', () => {
  test(
    '[CMF-01] @extended Given existing card machine, when fetched by ID, then returns 200 with card machine details',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_CARD_MACHINE_ID,
        'Set EXISTING_CARD_MACHINE_ID in .env to enable — requires a known card machine ID',
      );
      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/card_machines/${EXISTING_CARD_MACHINE_ID}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'card-machine-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_CARD_MACHINE_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[CMF-02] @smoke Given non-existent card machine ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/card_machines/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[CMF-03] @smoke Given card machine ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/card_machines/some-machine-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CMF-04] @smoke Given card machine ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/card_machines/some-machine-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CMF-05] @extended Given read-only scoped token, when fetching card machine by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/card_machines/some-machine-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[CMF-06] @extended Given throttled environment, when fetching card machine by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/card_machines/some-machine-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
