import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_STAFF_ID = process.env.EXISTING_STAFF_ID;

// ==== GET /v1/staff ====

test.describe('GET /v1/staff', () => {
  test(
    '[STF-01] @smoke Given authorized credentials, when listing staff, then returns 200 with staff list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/staff`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'staff-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[STF-02] @smoke Given no authorization, when listing staff, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/staff`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[STF-03] @smoke Given invalid token, when listing staff, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/staff`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[STF-04] @smoke Given invalid query parameter, when listing staff, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/staff?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[STF-05] @extended Given read-only scoped token, when listing staff, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/staff`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[STF-06] @extended Given throttled environment, when listing staff, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/staff`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/staff/:staff_id ====

test.describe('GET /v1/staff/:staff_id', () => {
  test(
    '[STFF-01] @extended Given existing staff member, when fetched by ID, then returns 200 with staff details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_STAFF_ID, 'Set EXISTING_STAFF_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/staff/${EXISTING_STAFF_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'staff-member-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_STAFF_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[STFF-02] @smoke Given non-existent staff ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/staff/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[STFF-03] @smoke Given staff ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/staff/some-staff-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[STFF-04] @smoke Given staff ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/staff/some-staff-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[STFF-05] @extended Given read-only scoped token, when fetching staff by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/staff/some-staff-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[STFF-06] @extended Given throttled environment, when fetching staff by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/staff/some-staff-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
