import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeWebhookSubscriptionPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ============================
// POST /v1/webhooks/subscriptions/
// ============================
test.describe('POST /v1/webhooks/subscriptions/', () => {

  test('[WH-01] @smoke Given valid webhook subscription payload, when created with authorized credentials, then returns 201 with subscription', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'webhook-subscription-response.json');
    expect(body.id).toBeDefined();
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-02] @smoke Given empty request body, when creating webhook subscription, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-03] @smoke Given no authorization, when creating webhook subscription, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: headersWithoutAuth(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-04] @smoke Given invalid token, when creating webhook subscription, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: headersWithInvalidToken(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-48] @extended Given read-only scoped credentials, when created with authorized credentials, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: readOnlyHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-49] @extended Given rate-limited environment, when created with authorized credentials, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/webhooks/subscriptions/
// ============================
test.describe('GET /v1/webhooks/subscriptions/', () => {

  test('[WH-07] @smoke Given authorized credentials, when listing webhook subscriptions, then returns 200 with subscription list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-08] @smoke Given invalid limit parameter, when listing webhook subscriptions, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      params: { limit: '999' },
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-09] @smoke Given no authorization, when listing webhook subscriptions, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-10] @smoke Given invalid token, when listing webhook subscriptions, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-50] @extended Given read-only scoped credentials, when listing webhook subscriptions, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-51] @extended Given rate-limited environment, when listing webhook subscriptions, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/webhooks/subscriptions/{subscription_id}
// ============================
test.describe('GET /v1/webhooks/subscriptions/{subscription_id}', () => {

  test('[WH-13] @smoke Given newly created subscription, when fetched by ID, then returns 200 with matching ID', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const subscriptionId: string = created.id;
    expect(subscriptionId).toBeDefined();

    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'webhook-subscription-response.json');
    expect(body.id).toBe(subscriptionId);
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-14] @smoke Given non-existent subscription ID, when fetching webhook subscription, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/non-existent-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-15] @smoke Given no authorization, when fetching webhook subscription by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-16] @smoke Given invalid token, when fetching webhook subscription by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-52] @extended Given read-only scoped credentials, when fetched by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-53] @extended Given rate-limited environment, when fetched by ID, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// DELETE /v1/webhooks/subscriptions/{subscription_id}
// ============================
test.describe('DELETE /v1/webhooks/subscriptions/{subscription_id}', () => {

  test('[WH-19] @smoke Given newly created subscription, when deleted, then returns 204 no content', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const subscriptionId: string = created.id;

    const response = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(204);
  });

  test('[WH-20] @smoke Given non-existent subscription ID, when deleting webhook subscription, then returns 404 not found', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/non-existent-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-21] @smoke Given no authorization, when deleting webhook subscription, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-22] @smoke Given invalid token, when deleting webhook subscription, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-54] @extended Given read-only scoped credentials, when deleted, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-55] @extended Given rate-limited environment, when deleted, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// PATCH /v1/webhooks/subscriptions/{subscription_id}
// ============================
test.describe('PATCH /v1/webhooks/subscriptions/{subscription_id}', () => {

  test('[WH-25] @smoke Given newly created subscription, when updated with valid payload, then returns 200 with updated subscription', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const subscriptionId: string = created.id;

    const start = Date.now();
    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
      data: { events: ['payment.succeeded', 'payment.failed'] },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'webhook-subscription-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-26] @smoke Given empty request body, when updating webhook subscription, then returns 400 bad request', async ({ request }) => {
    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: authHeaders(),
      data: { invalid_field_only: true },
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-27] @smoke Given no authorization, when updating webhook subscription, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: headersWithoutAuth(),
      data: { events: ['payment.succeeded'] },
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-28] @smoke Given invalid token, when updating webhook subscription, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id`, {
      headers: headersWithInvalidToken(),
      data: { events: ['payment.succeeded'] },
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-29] @smoke Given non-existent subscription ID, when updating webhook subscription, then returns 404 not found', async ({ request }) => {
    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/non-existent-99999`, {
      headers: authHeaders(),
      data: { events: ['payment.succeeded'] },
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-56] @extended Given read-only scoped credentials, when updated with valid payload, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-57] @extended Given rate-limited environment, when updated with valid payload, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// POST /v1/webhooks/subscriptions/{subscription_id}/secret
// ============================
test.describe('POST /v1/webhooks/subscriptions/{subscription_id}/secret', () => {

  test('[WH-32] @smoke Given newly created subscription, when secret rotated, then returns 200 with new secret', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const subscriptionId: string = created.id;

    const start = Date.now();
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/secret`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-33] @smoke Given non-existent subscription ID, when rotating secret, then returns 404 not found', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/non-existent-99999/secret`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-34] @smoke Given no authorization, when rotating webhook secret, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id/secret`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-35] @smoke Given invalid token, when rotating webhook secret, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id/secret`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-58] @extended Given read-only scoped credentials, when secret rotated, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001/secret`, {
      headers: readOnlyHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-59] @extended Given rate-limited environment, when secret rotated, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001/secret`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// POST /v1/webhooks/subscriptions/{subscription_id}/test
// ============================
test.describe('POST /v1/webhooks/subscriptions/{subscription_id}/test', () => {

  test('[WH-38] @smoke Given newly created subscription, when test webhook event sent, then returns 200', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const subscriptionId: string = created.id;

    const start = Date.now();
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/test`, {
      headers: authHeaders(),
      data: { event_type: 'payment.succeeded' },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-39] @smoke Given empty request body, when sending test webhook event, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-40] @smoke Given non-existent subscription ID, when sending test webhook event, then returns 404 not found', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/non-existent-99999/test`, {
      headers: authHeaders(),
      data: { event_type: 'payment.succeeded' },
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-41] @smoke Given no authorization, when sending test webhook event, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`, {
      headers: headersWithoutAuth(),
      data: { event_type: 'payment.succeeded' },
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-42] @smoke Given invalid token, when sending test webhook event, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`, {
      headers: headersWithInvalidToken(),
      data: { event_type: 'payment.succeeded' },
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-60] @extended Given read-only scoped credentials, when test webhook event sent, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001/test`, {
      headers: readOnlyHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-61] @extended Given rate-limited environment, when test webhook event sent, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions/00000000-0000-0000-0000-000000000001/test`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/webhooks/events/
// ============================
test.describe('GET /v1/webhooks/events/', () => {

  test('[WH-45] @smoke Given authorized credentials, when listing webhook event definitions, then returns 200 with event list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/webhooks/events/`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(Array.isArray(body) || body.items !== undefined || body.data !== undefined).toBe(true);
    expect(duration).toBeLessThan(5000);
  });

  test('[WH-46] @smoke Given no authorization, when listing webhook event definitions, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/events/`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-47] @smoke Given invalid token, when listing webhook event definitions, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webhooks/events/`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WH-62] @extended Given read-only scoped credentials, when listing webhook event definitions, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/webhooks/events/`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WH-63] @extended Given rate-limited environment, when listing webhook event definitions, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/webhooks/events/`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
