import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentLinkPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ============================
// POST /v1/payment_links/
// ============================
test.describe('POST /v1/payment_links/', () => {

  test('[PL-01] @smoke Given valid payment link payload, when created with authorized credentials, then returns 201 with payment link', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'payment-link-response.json');
    expect(body.id).toBeDefined();
    expect(duration).toBeLessThan(5000);
  });

  test('[PL-02] @smoke Given empty request body, when creating payment link, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-03] @smoke Given no authorization, when creating payment link, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: headersWithoutAuth(),
      data: makePaymentLinkPayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-04] @smoke Given invalid token, when creating payment link, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: headersWithInvalidToken(),
      data: makePaymentLinkPayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PL-23] @extended Given read-only scoped credentials, when created with authorized credentials, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: readOnlyHeaders(),
      data: makePaymentLinkPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-24] @extended Given rate-limited environment, when created with authorized credentials, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/payment_links/
// ============================
test.describe('GET /v1/payment_links/', () => {

  test('[PL-07] @smoke Given authorized credentials, when listing payment links, then returns 200 with link list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[PL-08] @smoke Given invalid date range, when listing payment links, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payment_links/`, {
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

  test('[PL-09] @smoke Given no authorization, when listing payment links, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payment_links/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-10] @smoke Given invalid token, when listing payment links, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payment_links/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PL-25] @extended Given read-only scoped credentials, when listing payment links, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/payment_links/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-26] @extended Given rate-limited environment, when listing payment links, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/payment_links/{payment_link_id}
// ============================
test.describe('GET /v1/payment_links/{payment_link_id}', () => {

  test('[PL-13] @smoke Given newly created payment link, when fetched by ID, then returns 200 with matching ID', async ({ request }) => {
    // Self-seed: create the resource first
    const createResp = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const paymentLinkId: string = created.id;
    expect(paymentLinkId).toBeDefined();

    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'payment-link-response.json');
    expect(body.id).toBe(paymentLinkId);
    expect(duration).toBeLessThan(5000);
  });

  test('[PL-14] @smoke Given non-existent payment link ID, when fetching payment link, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payment_links/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-15] @smoke Given no authorization, when fetching payment link by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payment_links/some-link-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-16] @smoke Given invalid token, when fetching payment link by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payment_links/some-link-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PL-27] @extended Given read-only scoped credentials, when fetched by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/payment_links/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
      data: makePaymentLinkPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-28] @extended Given rate-limited environment, when fetched by ID, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/payment_links/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// DELETE /v1/payment_links/{payment_link_id}
// ============================
test.describe('DELETE /v1/payment_links/{payment_link_id}', () => {

  test('[PL-19] @smoke Given newly created payment link, when deleted with authorized credentials, then returns 204 no content', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const paymentLinkId: string = created.id;

    const response = await request.delete(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(204);
  });

  test('[PL-20] @smoke Given non-existent payment link ID, when deleting payment link, then returns 404 not found', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/v1/payment_links/non-existent-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-21] @smoke Given no authorization, when deleting payment link, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/v1/payment_links/some-link-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-22] @smoke Given invalid token, when deleting payment link, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/v1/payment_links/some-link-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[PL-29] @extended Given read-only scoped credentials, when deleted with authorized credentials, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.delete(`${API_BASE}/v1/payment_links/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
      data: makePaymentLinkPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[PL-30] @extended Given rate-limited environment, when deleted with authorized credentials, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.delete(`${API_BASE}/v1/payment_links/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
