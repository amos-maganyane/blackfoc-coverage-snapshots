import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/locations/
// ============================
test.describe('GET /v1/locations/', () => {

  test('[LO-01] @smoke Given authorized credentials, when listing locations, then returns 200 with location list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/locations/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[LO-02] @smoke Given invalid limit parameter, when listing locations, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/locations/`, {
      headers: authHeaders(),
      params: { limit: '999' },
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[LO-03] @smoke Given no authorization, when listing locations, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/locations/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[LO-04] @smoke Given invalid token, when listing locations, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/locations/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[LO-10] @extended Given read-only scoped credentials, when listing locations, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/locations/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[LO-11] @extended Given rate-limited environment, when listing locations, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/locations/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/locations/{location_id}
// ============================
test.describe('GET /v1/locations/{location_id}', () => {

  test('[LO-07] @smoke Given non-existent location ID, when fetching location, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/locations/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[LO-08] @smoke Given no authorization, when fetching location by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/locations/some-location-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[LO-09] @smoke Given invalid token, when fetching location by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/locations/some-location-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[LO-10] @extended Given a pre-existing location ID, when fetching location by ID, then returns 200 with matching id', async ({ request }) => {
    const resourceId = process.env.TEST_LOCATION_ID;
    test.skip(!resourceId, 'Skipped: set TEST_LOCATION_ID to a real location ID to execute');

    const response = await request.get(`${API_BASE}/v1/locations/${resourceId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(body).not.toBeNull();
  });


  test('[LO-12] @extended Given read-only scoped credentials, when fetching location, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/locations/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[LO-13] @extended Given rate-limited environment, when fetching location, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/locations/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
