import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeWebhookSubscriptionPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const EXISTING_SUBSCRIPTION_ID = process.env.EXISTING_SUBSCRIPTION_ID;

// ==== GET /v1/webhooks/events ====

test.describe('GET /v1/webhooks/events', () => {
  test(
    '[WKE-01] @smoke Given authorized credentials, when listing webhook event definitions, then returns 200 with events list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/webhooks/events`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webhook-events-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKE-02] @smoke Given no authorization, when listing webhook event definitions, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webhooks/events`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKE-03] @smoke Given invalid token, when listing webhook event definitions, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webhooks/events`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKE-04] @extended Given read-only scoped token, when listing webhook event definitions, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/webhooks/events`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKE-05] @extended Given throttled environment, when listing webhook event definitions, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/webhooks/events`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/webhooks/subscriptions ====

test.describe('GET /v1/webhooks/subscriptions', () => {
  test(
    '[WKS-01] @smoke Given authorized credentials, when listing webhook subscriptions, then returns 200 with subscriptions list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webhook-subscriptions-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKS-02] @smoke Given no authorization, when listing webhook subscriptions, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKS-03] @smoke Given invalid token, when listing webhook subscriptions, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKS-04] @smoke Given invalid query parameter, when listing webhook subscriptions, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WKS-05] @extended Given read-only scoped token, when listing webhook subscriptions, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKS-06] @extended Given throttled environment, when listing webhook subscriptions, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== POST /v1/webhooks/subscriptions ====

test.describe('POST /v1/webhooks/subscriptions', () => {
  test(
    '[WKSC-01] @smoke Given valid webhook subscription payload, when created with authorized credentials, then returns 201 with subscription details',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(201);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webhook-subscription-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKSC-02] @smoke Given valid payload, when submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithoutAuth(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSC-03] @smoke Given empty request body, when subscription creation attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: {},
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WKSC-04] @smoke Given valid payload, when submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithInvalidToken(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSC-05] @extended Given read-only scoped token, when creating webhook subscription, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithReadOnlyToken(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKSC-06] @extended Given throttled environment, when creating webhook subscription, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/webhooks/subscriptions/:subscription_id ====

test.describe('GET /v1/webhooks/subscriptions/:subscription_id', () => {
  test(
    '[WKSF-01] @smoke Given newly created subscription, when fetched by ID, then returns 200 with matching subscription',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webhook-subscription-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(subscriptionId);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKSF-02] @smoke Given non-existent subscription ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WKSF-03] @smoke Given subscription ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSF-04] @smoke Given subscription ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSF-05] @extended Given read-only scoped token, when fetching subscription by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKSF-06] @extended Given throttled environment, when fetching subscription by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== PATCH /v1/webhooks/subscriptions/:subscription_id ====

test.describe('PATCH /v1/webhooks/subscriptions/:subscription_id', () => {
  test(
    '[WKSU-01] @smoke Given existing subscription, when updated with authorized credentials, then returns 200 with updated subscription',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const start = Date.now();
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`,
        {
          headers: authHeaders(),
          data: { events: ['payment.created'] },
        },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKSU-02] @smoke Given subscription ID, when update submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        {
          headers: headersWithoutAuth(),
          data: { events: ['payment.created'] },
        },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSU-03] @smoke Given non-existent subscription ID, when update attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/non-existent-id-99999`,
        {
          headers: authHeaders(),
          data: { events: ['payment.created'] },
        },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WKSU-04] @smoke Given empty request body, when subscription update attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        {
          headers: authHeaders(),
          data: {},
        },
      );
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WKSU-05] @smoke Given subscription ID, when update submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        {
          headers: headersWithInvalidToken(),
          data: { events: ['payment.created'] },
        },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSU-06] @extended Given read-only scoped token, when updating subscription, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        {
          headers: headersWithReadOnlyToken(),
          data: { events: ['payment.created'] },
        },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKSU-07] @extended Given throttled environment, when updating subscription, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        {
          headers: authHeaders(),
          data: { events: ['payment.created'] },
        },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== DELETE /v1/webhooks/subscriptions/:subscription_id ====

test.describe('DELETE /v1/webhooks/subscriptions/:subscription_id', () => {
  test(
    '[WKSD-01] @smoke Given existing subscription, when deleted with authorized credentials, then returns 200',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const response = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(200);
    },
  );

  test(
    '[WKSD-02] @smoke Given subscription ID, when delete submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSD-03] @smoke Given non-existent subscription ID, when delete attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WKSD-04] @smoke Given subscription ID, when delete submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSD-05] @extended Given read-only scoped token, when deleting subscription, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKSD-06] @extended Given throttled environment, when deleting subscription, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== POST /v1/webhooks/subscriptions/:subscription_id/secret ====

test.describe('POST /v1/webhooks/subscriptions/:subscription_id/secret', () => {
  test(
    '[WKSS-01] @smoke Given existing subscription, when secret rotated with authorized credentials, then returns 200 with new secret',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const start = Date.now();
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/secret`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webhook-secret-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKSS-02] @smoke Given subscription ID, when secret rotation submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/secret`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSS-03] @smoke Given non-existent subscription ID, when secret rotation attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/non-existent-id-99999/secret`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WKSS-04] @smoke Given malformed subscription ID, when secret rotation attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/ /secret`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WKSS-05] @smoke Given subscription ID, when secret rotation submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/secret`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKSS-06] @extended Given read-only scoped token, when rotating subscription secret, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/secret`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKSS-07] @extended Given throttled environment, when rotating subscription secret, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/secret`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== POST /v1/webhooks/subscriptions/:subscription_id/test ====

test.describe('POST /v1/webhooks/subscriptions/:subscription_id/test', () => {
  test(
    '[WKST-01] @smoke Given existing subscription, when test webhook event sent with authorized credentials, then returns 200',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const start = Date.now();
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/test`,
        {
          headers: authHeaders(),
          data: { eventType: 'payment.created' },
        },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WKST-02] @smoke Given subscription ID, when test event submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`,
        {
          headers: headersWithoutAuth(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKST-03] @smoke Given non-existent subscription ID, when test event attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/non-existent-id-99999/test`,
        {
          headers: authHeaders(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WKST-04] @smoke Given empty request body, when test event attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`,
        {
          headers: authHeaders(),
          data: {},
        },
      );
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WKST-05] @smoke Given subscription ID, when test event submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`,
        {
          headers: headersWithInvalidToken(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WKST-06] @extended Given read-only scoped token, when sending test webhook event, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`,
        {
          headers: headersWithReadOnlyToken(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WKST-07] @extended Given throttled environment, when sending test webhook event, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/some-sub-id/test`,
        {
          headers: authHeaders(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(response.status()).toBe(429);
    },
  );
});
