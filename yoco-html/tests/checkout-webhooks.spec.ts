import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeWebhookPayload } from './helpers/test-data';

const CHECKOUT_BASE = process.env.CHECKOUT_API_BASE!;

// ==== GET /api/webhooks ====

test.describe('GET /api/webhooks (Checkout)', () => {
  test(
    '[CWL-01] @smoke Given authorized credentials, when listing checkout webhooks, then returns 200 with webhook list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'checkout-webhook-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[CWL-02] @smoke Given no authorization, when listing checkout webhooks, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CWL-03] @smoke Given invalid token, when listing checkout webhooks, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CWL-04] @smoke Given invalid query parameter, when listing checkout webhooks, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${CHECKOUT_BASE}/api/webhooks?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[CWL-05] @extended Given read-only scoped token, when listing checkout webhooks, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );
});

// ==== POST /api/webhooks ====

test.describe('POST /api/webhooks (Checkout)', () => {
  test(
    '[CWR-01] @smoke Given valid webhook payload, when registered with authorized credentials, then returns 200 with webhook details',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: authHeaders(),
        data: makeWebhookPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'checkout-webhook-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[CWR-02] @smoke Given valid webhook payload, when submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: headersWithoutAuth(),
        data: makeWebhookPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CWR-03] @smoke Given empty request body, when webhook registration attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: authHeaders(),
        data: {},
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[CWR-04] @extended Given read-only scoped token, when registering checkout webhook, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: headersWithReadOnlyToken(),
        data: makeWebhookPayload(),
      });
      expect(response.status()).toBe(403);
    },
  );
});

// ==== DELETE /api/webhooks/:id ====

test.describe('DELETE /api/webhooks/:id (Checkout)', () => {
  test(
    '[CWD-01] @smoke Given existing webhook, when deleted with authorized credentials, then returns 200',
    async ({ request }) => {
      const createResp = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: authHeaders(),
        data: makeWebhookPayload(),
      });
      expect(createResp.status()).toBe(200);
      const webhook = await createResp.json() as { id: string };
      const webhookId = webhook.id;

      const response = await request.delete(`${CHECKOUT_BASE}/api/webhooks/${webhookId}`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(200);
    },
  );

  test(
    '[CWD-02] @smoke Given webhook id, when delete submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(`${CHECKOUT_BASE}/api/webhooks/hook_test123`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[CWD-03] @smoke Given non-existent webhook ID, when delete attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.delete(`${CHECKOUT_BASE}/api/webhooks/non-existent-id-99999`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[CWD-04] @smoke Given malformed webhook ID, when delete attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.delete(`${CHECKOUT_BASE}/api/webhooks/%20`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[CWD-05] @extended Given read-only scoped token, when deleting checkout webhook, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.delete(`${CHECKOUT_BASE}/api/webhooks/some-webhook-id`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );
});
