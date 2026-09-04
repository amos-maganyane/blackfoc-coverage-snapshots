import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/capital/active_offers
// ============================
test.describe('GET /v1/capital/active_offers', () => {

  test('[CA-01] @smoke Given authorized credentials, when listing active Capital offers, then returns 200 with offer list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CA-02] @smoke Given no authorization, when listing active Capital offers, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[CA-03] @smoke Given invalid token, when listing active Capital offers, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[CA-09] @extended Given read-only scoped credentials, when listing active Capital offers, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[CA-10] @extended Given rate-limited environment, when listing active Capital offers, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/capital/active_offers`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/capital/active_advances
// ============================
test.describe('GET /v1/capital/active_advances', () => {

  test('[CA-06] @smoke Given authorized credentials, when listing active Capital advances, then returns 200 with advances list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CA-07] @smoke Given no authorization, when listing active Capital advances, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[CA-08] @smoke Given invalid token, when listing active Capital advances, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[CA-11] @extended Given read-only scoped credentials, when listing active Capital advances, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[CA-12] @extended Given rate-limited environment, when listing active Capital advances, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/capital/active_advances`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
