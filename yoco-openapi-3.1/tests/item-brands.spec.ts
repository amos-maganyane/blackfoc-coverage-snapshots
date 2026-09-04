import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/item_brands/
// ============================
test.describe('GET /v1/item_brands/', () => {

  test('[IB-01] @smoke Given authorized credentials, when listing item brands, then returns 200 with brand list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/item_brands/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[IB-02] @smoke Given invalid date range exceeding 31 days, when listing item brands, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_brands/`, {
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

  test('[IB-03] @smoke Given no authorization, when listing item brands, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_brands/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IB-04] @smoke Given invalid token, when listing item brands, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_brands/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[IB-10] @extended Given read-only scoped credentials, when listing item brands, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/item_brands/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IB-11] @extended Given rate-limited environment, when listing item brands, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/item_brands/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/item_brands/{item_brand_id}
// ============================
test.describe('GET /v1/item_brands/{item_brand_id}', () => {

  test('[IB-07] @smoke Given non-existent item brand ID, when fetching item brand, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_brands/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IB-08] @smoke Given no authorization, when fetching item brand by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_brands/some-brand-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IB-09] @smoke Given invalid token, when fetching item brand by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/item_brands/some-brand-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[IB-12] @extended Given read-only scoped credentials, when fetching item brand, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/item_brands/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[IB-13] @extended Given rate-limited environment, when fetching item brand, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/item_brands/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
