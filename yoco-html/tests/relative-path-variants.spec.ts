import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentLinkPayload, makeWebhookSubscriptionPayload } from './helpers/test-data';

/**
 * Covers relative-path API spec variants for:
 * - GET /v1/orders (doc example variants)
 * - GET /v1/orders/1851231235 (fixed order ID)
 * - PUT /v1/orders/1851231235
 * - DELETE /v1/orders/1851231235
 * - PATCH /v1/orders/1851231235
 * - POST /v1/payment_links (relative path variant)
 * - POST /v1/webhooks/subscriptions (relative path variant)
 * - POST /v1/webhooks/subscriptions/:subscription_id/test (relative path variant)
 * - POST /api/checkouts (relative path variant)
 * - POST /api/checkouts/:id/refund (relative path variant)
 * - POST /api/webhooks (relative path variant)
 */

const API_BASE = process.env.API_BASE!;
const CHECKOUT_BASE = process.env.CHECKOUT_API_BASE!;

// ==== GET /v1/orders (relative path doc variants) ====

test.describe('GET /v1/orders (relative path variants)', () => {
  test(
    '[RORD-01] @smoke Given authorized credentials, when orders listed via API base, then returns 200 with orders list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/orders`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'orders-list-response.json');
      expect(duration).toBeLessThan(8000);
    },
  );
});

// ==== GET /v1/orders/{non-existent-id} (relative path variant) ====

test.describe('GET /v1/orders/:order_id (relative path variant)', () => {
  test(
    '[RORDX-01] @extended Given a non-existent order ID, when fetched via API base relative path, then returns 404',
    { tag: ['@extended'] },
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[RORDX-02] @smoke Given fixed order ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders/1851231235`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== PUT /v1/orders/{non-existent-id} (relative path variant) ====

test.describe('PUT /v1/orders/:order_id (relative path variant)', () => {
  test(
    '[RORDP-01] @smoke Given order ID, when PUT submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.put(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: headersWithoutAuth(),
        data: { status: 'cancelled' },
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[RORDP-02] @extended Given a non-existent order ID, when updated via PUT with authorized credentials, then returns 404',
    { tag: ['@extended'] },
    async ({ request }) => {
      const response = await request.put(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
        data: { status: 'cancelled' },
      });
      expect(response.status()).toBe(404);
    },
  );
});

// ==== DELETE /v1/orders/{non-existent-id} (relative path variant) ====

test.describe('DELETE /v1/orders/:order_id (relative path variant)', () => {
  test(
    '[RORDD-01] @smoke Given order ID, when DELETE submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[RORDD-02] @extended Given a non-existent order ID, when deleted with authorized credentials, then returns 404',
    { tag: ['@extended'] },
    async ({ request }) => {
      const response = await request.delete(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(404);
    },
  );
});

// ==== PATCH /v1/orders/{non-existent-id} (relative path variant) ====

test.describe('PATCH /v1/orders/:order_id (relative path variant)', () => {
  test(
    '[RORDM-01] @smoke Given order ID, when PATCH submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.patch(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: headersWithoutAuth(),
        data: { status: 'cancelled' },
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[RORDM-02] @extended Given a non-existent order ID, when partially updated via PATCH with authorized credentials, then returns 404',
    { tag: ['@extended'] },
    async ({ request }) => {
      const response = await request.patch(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
        data: { status: 'cancelled' },
      });
      expect(response.status()).toBe(404);
    },
  );
});

// ==== POST /v1/payment_links (relative) ====

test.describe('POST /v1/payment_links (relative path variant)', () => {
  test(
    '[RPL-01] @smoke Given valid payment link payload, when created via API base relative path, then returns 200',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: makePaymentLinkPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[RPL-02] @smoke Given valid payload, when submitted without authorization via relative path, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: headersWithoutAuth(),
        data: makePaymentLinkPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== POST /v1/webhooks/subscriptions (relative) ====

test.describe('POST /v1/webhooks/subscriptions (relative path variant)', () => {
  test(
    '[RWKS-01] @smoke Given valid subscription payload, when created via API base relative path, then returns 200',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[RWKS-02] @smoke Given valid payload, when submitted without authorization via relative path, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: headersWithoutAuth(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== POST /v1/webhooks/subscriptions/:subscription_id/test (relative) ====

test.describe('POST /v1/webhooks/subscriptions/:subscription_id/test (relative path)', () => {
  test(
    '[RWKST-01] @smoke Given existing subscription, when test event sent via relative path, then returns 200 or 404',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(200);
      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const response = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/test`,
        {
          headers: authHeaders(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(response.status()).toBe(200);
    },
  );

  test(
    '[RWKST-02] @smoke Given subscription ID, when test event submitted without authorization, then returns 401 unauthorized',
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
});

// ==== POST /api/checkouts (relative path) ====

test.describe('POST /api/checkouts (relative path variant)', () => {
  test(
    '[RCHK-01] @smoke Given valid checkout payload, when created via checkout base relative path, then returns 200',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: authHeaders(),
        data: {
          amount: 2000,
          currency: 'ZAR',
          cancelUrl: 'https://example.com/cancel',
          successUrl: 'https://example.com/success',
          failureUrl: 'https://example.com/failure',
        },
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[RCHK-02] @smoke Given valid payload, when submitted without authorization via relative path, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: headersWithoutAuth(),
        data: {
          amount: 2000,
          currency: 'ZAR',
        },
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== POST /api/checkouts/:id/refund (relative) ====

test.describe('POST /api/checkouts/:id/refund (relative path variant)', () => {
  test(
    '[RCHKR-01] @smoke Given checkout ID ch_abc123, when refund submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/checkouts/ch_abc123/refund`, {
        headers: headersWithoutAuth(),
        data: { amount: 1000 },
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[RCHKR-02] @smoke Given non-existent checkout ID, when refund attempted via relative path, then returns 404 not found',
    async ({ request }) => {
      const response = await request.post(
        `${CHECKOUT_BASE}/api/checkouts/non-existent-id-99999/refund`,
        {
          headers: authHeaders(),
          data: { amount: 1000 },
        },
      );
      expect(response.status()).toBe(404);
    },
  );
});

// ==== POST /api/webhooks (relative) ====

test.describe('POST /api/webhooks (relative path variant)', () => {
  test(
    '[RWKH-01] @smoke Given valid webhook payload, when registered via checkout base relative path, then returns 200',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: authHeaders(),
        data: {
          url: 'https://webhook.example.com/notify',
          event: 'payment.succeeded',
        },
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[RWKH-02] @smoke Given valid payload, when submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${CHECKOUT_BASE}/api/webhooks`, {
        headers: headersWithoutAuth(),
        data: {
          url: 'https://webhook.example.com/notify',
          event: 'payment.succeeded',
        },
      });
      expect(response.status()).toBe(401);
    },
  );
});
