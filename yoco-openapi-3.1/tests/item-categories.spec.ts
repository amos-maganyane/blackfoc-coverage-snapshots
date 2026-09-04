import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/item_categories/
// ============================
test.describe('GET /v1/item_categories/', () => {

  test('[IC-01] @smoke Given authorized credentials, when listing item categories, then returns 200 with category list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/item_categories/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[IC-02] @smoke Given invalid date range, when listing item categories, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_categories/`, {
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

  test('[IC-03] @smoke Given no authorization, when listing item categories, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_categories/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IC-04] @smoke Given invalid token, when listing item categories, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_categories/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[IC-10] @extended Given read-only scoped credentials, when listing item categories, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/item_categories/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IC-11] @extended Given rate-limited environment, when listing item categories, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/item_categories/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/item_categories/{item_category_id}
// ============================
test.describe('GET /v1/item_categories/{item_category_id}', () => {

  test('[IC-07] @smoke Given non-existent item category ID, when fetching item category, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_categories/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IC-08] @smoke Given no authorization, when fetching item category by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_categories/some-category-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IC-09] @smoke Given invalid token, when fetching item category by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_categories/some-category-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[IC-10] @extended Given a pre-existing item category ID, when fetching item category by ID, then returns 200 with matching id', async ({ request }) => {
    const resourceId = process.env.TEST_ITEM_CATEGORY_ID;
    test.skip(!resourceId, 'Skipped: set TEST_ITEM_CATEGORY_ID to a real item category ID to execute');

    const response = await request.get(`${API_BASE}/v1/item_categories/${resourceId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(body).not.toBeNull();
  });


  test('[IC-12] @extended Given read-only scoped credentials, when fetching item category, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/item_categories/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IC-13] @extended Given rate-limited environment, when fetching item category, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/item_categories/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
