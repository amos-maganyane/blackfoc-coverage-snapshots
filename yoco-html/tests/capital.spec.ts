import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ==== GET /v1/capital/active_advances ====

test.describe('GET /v1/capital/active_advances', () => {
  test(
    '[CAA-01] @smoke Given authorized credentials, when listing active capital advances, then returns 200 with advances list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'capital-advances-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );

  test(
    '[CAA-02] @smoke Given no authorization, when listing capital advances, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CAA-03] @smoke Given invalid token, when listing capital advances, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CAA-04] @extended Given read-only scoped token, when listing capital advances, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[CAA-05] @extended Given throttled environment, when listing capital advances, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/capital/active_offers ====

test.describe('GET /v1/capital/active_offers', () => {
  test(
    '[CAO-01] @smoke Given authorized credentials, when listing active capital offers, then returns 200 with offers list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'capital-offers-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );

  test(
    '[CAO-02] @smoke Given no authorization, when listing capital offers, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CAO-03] @smoke Given invalid token, when listing capital offers, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CAO-04] @extended Given read-only scoped token, when listing capital offers, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[CAO-05] @extended Given throttled environment, when listing capital offers, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});
