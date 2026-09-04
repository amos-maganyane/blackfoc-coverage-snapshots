import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/staff/
// ============================
test.describe('GET /v1/staff/', () => {

  test('[ST-01] @smoke Given authorized credentials, when listing staff members, then returns 200 with staff list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/staff/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[ST-02] @smoke Given invalid date range, when listing staff members, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/staff/`, {
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

  test('[ST-03] @smoke Given no authorization, when listing staff members, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/staff/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[ST-04] @smoke Given invalid token, when listing staff members, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/staff/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[ST-10] @extended Given read-only scoped credentials, when listing staff members, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/staff/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[ST-11] @extended Given rate-limited environment, when listing staff members, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/staff/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/staff/{staff_id}
// ============================
test.describe('GET /v1/staff/{staff_id}', () => {

  test('[ST-07] @smoke Given non-existent staff ID, when fetching staff member, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/staff/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[ST-08] @smoke Given no authorization, when fetching staff member by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/staff/some-staff-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[ST-09] @smoke Given invalid token, when fetching staff member by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/staff/some-staff-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[ST-12] @extended Given read-only scoped credentials, when fetching staff member, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/staff/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[ST-13] @extended Given rate-limited environment, when fetching staff member, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/staff/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
