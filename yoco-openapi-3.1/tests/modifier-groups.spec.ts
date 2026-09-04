import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/modifier_groups/
// ============================
test.describe('GET /v1/modifier_groups/', () => {

  test('[MG-01] @smoke Given authorized credentials, when listing modifier groups, then returns 200 with group list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/modifier_groups/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[MG-02] @smoke Given invalid date range, when listing modifier groups, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/modifier_groups/`, {
      headers: authHeaders(),
      params: {
        created_at__gte: '2024-01-01T00:00:00Z',
        created_at__lte: '2024-03-01T00:00:00Z',
      },
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[MG-03] @smoke Given no authorization, when listing modifier groups, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/modifier_groups/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[MG-04] @smoke Given invalid token, when listing modifier groups, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/modifier_groups/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[MG-10] @extended Given read-only scoped credentials, when listing modifier groups, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/modifier_groups/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[MG-11] @extended Given rate-limited environment, when listing modifier groups, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/modifier_groups/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/modifier_groups/{modifier_group_id}
// ============================
test.describe('GET /v1/modifier_groups/{modifier_group_id}', () => {

  test('[MG-07] @smoke Given non-existent modifier group ID, when fetching modifier group, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/modifier_groups/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[MG-08] @smoke Given no authorization, when fetching modifier group by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/modifier_groups/some-group-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[MG-09] @smoke Given invalid token, when fetching modifier group by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/modifier_groups/some-group-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[MG-12] @extended Given read-only scoped credentials, when fetching modifier group, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/modifier_groups/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[MG-13] @extended Given rate-limited environment, when fetching modifier group, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/modifier_groups/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
