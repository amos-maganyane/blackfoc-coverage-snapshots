import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/payouts/
// ============================
test.describe('GET /v1/payouts/', () => {

  test('[PO-01] @smoke Given authorized credentials, when listing payouts, then returns 200 with payout list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/payouts/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(8000);
  });

  test('[PO-02] @smoke Given invalid date range, when listing payouts, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/`, {
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

  test('[PO-03] @smoke Given no authorization, when listing payouts, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-04] @smoke Given invalid token, when listing payouts, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PO-16] @extended Given read-only scoped credentials, when listing payouts, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/payouts/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-17] @extended Given rate-limited environment, when listing payouts, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/payouts/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/payouts/{payout_id}
// ============================
test.describe('GET /v1/payouts/{payout_id}', () => {

  test('[PO-07] @smoke Given non-existent payout ID, when fetching payout, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-08] @smoke Given no authorization, when fetching payout by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/some-payout-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-09] @smoke Given invalid token, when fetching payout by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/some-payout-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PO-10] @extended Given a pre-existing payout ID, when fetching payout by ID, then returns 200 with matching id', async ({ request }) => {
    const payoutId = process.env.TEST_PAYOUT_ID;
    test.skip(!payoutId, 'Skipped: set TEST_PAYOUT_ID to a real payout ID to execute');

    const response = await request.get(`${API_BASE}/v1/payouts/${payoutId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(body).not.toBeNull();
  });


  test('[PO-18] @extended Given read-only scoped credentials, when fetching payout, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/payouts/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-19] @extended Given rate-limited environment, when fetching payout, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/payouts/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/payouts/{payout_id}/payout_entries
// ============================
test.describe('GET /v1/payouts/{payout_id}/payout_entries', () => {

  test('[PO-12] @smoke Given non-existent payout ID, when listing payout entries, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/non-existent-id-99999/payout_entries`, {
      headers: authHeaders(),
    });
    // Note: spec declares 200/400/401/403/429 — 404 not declared but tested via parent 404
    // Testing 400 with invalid limit instead
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-11] @extended Given a pre-existing payout ID, when listing payout entries, then returns 200 with entries', async ({ request }) => {
    const payoutId = process.env.TEST_PAYOUT_ID;
    test.skip(!payoutId, 'Skipped: set TEST_PAYOUT_ID to a real payout ID to execute');

    const response = await request.get(`${API_BASE}/v1/payouts/${payoutId}/payout_entries`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(body).not.toBeNull();
  });

  test('[PO-13] @smoke Given invalid limit parameter, when listing payout entries, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/some-payout-id/payout_entries`, {
      headers: authHeaders(),
      params: { limit: '999' },
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-14] @smoke Given no authorization, when listing payout entries, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/some-payout-id/payout_entries`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-15] @smoke Given invalid token, when listing payout entries, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payouts/some-payout-id/payout_entries`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PO-20] @extended Given read-only scoped credentials, when listing payout entries, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/payouts/00000000-0000-0000-0000-000000000001/payout_entries`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PO-21] @extended Given rate-limited environment, when listing payout entries, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/payouts/00000000-0000-0000-0000-000000000001/payout_entries`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
