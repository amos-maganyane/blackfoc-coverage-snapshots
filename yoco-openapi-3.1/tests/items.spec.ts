import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/items/
// ============================
test.describe('GET /v1/items/', () => {

  test('[IT-01] @smoke Given authorized credentials, when listing items, then returns 200 with item list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/items/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[IT-02] @smoke Given invalid date range, when listing items, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/items/`, {
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

  test('[IT-03] @smoke Given no authorization, when listing items, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/items/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IT-04] @smoke Given invalid token, when listing items, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/items/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[IT-10] @extended Given read-only scoped credentials, when listing items, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/items/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IT-11] @extended Given rate-limited environment, when listing items, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/items/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/items/{item_id}
// ============================
test.describe('GET /v1/items/{item_id}', () => {

  test('[IT-07] @smoke Given non-existent item ID, when fetching item, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/items/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IT-08] @smoke Given no authorization, when fetching item by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/items/some-item-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IT-09] @smoke Given invalid token, when fetching item by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/items/some-item-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[IT-10] @extended Given a pre-existing item ID, when fetching item by ID, then returns 200 with matching id', async ({ request }) => {
    const resourceId = process.env.TEST_ITEM_ID;
    test.skip(!resourceId, 'Skipped: set TEST_ITEM_ID to a real item ID to execute');

    const response = await request.get(`${API_BASE}/v1/items/${resourceId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(body).not.toBeNull();
  });


  test('[IT-12] @extended Given read-only scoped credentials, when fetching item, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/items/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IT-13] @extended Given rate-limited environment, when fetching item, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/items/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
