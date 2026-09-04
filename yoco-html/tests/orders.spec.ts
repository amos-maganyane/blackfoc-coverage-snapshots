import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_ORDER_ID = process.env.EXISTING_ORDER_ID;

// ==== GET /v1/orders ====

test.describe('GET /v1/orders', () => {
  test(
    '[ORD-01] @smoke Given authorized credentials, when listing orders, then returns 200 with orders list',
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

  test(
    '[ORD-02] @smoke Given no authorization, when listing orders, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ORD-03] @smoke Given invalid token, when listing orders, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ORD-04] @smoke Given invalid query parameter, when listing orders, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[ORD-05] @extended Given read-only scoped token, when listing orders, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/orders`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ORD-06] @extended Given throttled environment, when listing orders, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/orders`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/orders/:order_id ====

test.describe('GET /v1/orders/:order_id', () => {
  test(
    '[ORDF-01] @extended Given existing order, when fetched by ID, then returns 200 with order details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_ORDER_ID, 'Set EXISTING_ORDER_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/orders/${EXISTING_ORDER_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'order-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_ORDER_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[ORDF-02] @smoke Given non-existent order ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[ORDF-03] @smoke Given order ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ORDF-04] @extended Given read-only scoped token, when fetching order by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ORDF-05] @extended Given throttled environment, when fetching order by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/orders/some-order-id`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== PUT /v1/orders/:order_id ====

test.describe('PUT /v1/orders/:order_id', () => {
  test(
    '[ORDU-01] @extended Given existing order, when replaced with valid payload, then returns 200 with updated order',
    async ({ request }) => {
      test.skip(!EXISTING_ORDER_ID, 'Set EXISTING_ORDER_ID in .env to enable');
      const response = await request.put(`${API_BASE}/v1/orders/${EXISTING_ORDER_ID}`, {
        headers: authHeaders(),
        data: { status: 'CANCELLED' },
      });

      expect(response.status()).toBe(200);
      const body: unknown = await response.json();
      validateSchema(body, 'order-response.json');
    },
  );

  test(
    '[ORDU-02] @smoke Given no authorization, when replacing an order, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.put(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithoutAuth(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ORDU-03] @smoke Given non-existent order ID, when replaced, then returns 404 not found',
    async ({ request }) => {
      const response = await request.put(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[ORDU-04] @extended Given read-only scoped token, when replacing an order, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.put(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithReadOnlyToken(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ORDU-05] @extended Given throttled environment, when replacing an order, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.put(`${API_BASE}/v1/orders/some-order-id`, {
        headers: authHeaders(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== PATCH /v1/orders/:order_id ====

test.describe('PATCH /v1/orders/:order_id', () => {
  test(
    '[ORDP-01] @extended Given existing order, when partially updated with valid payload, then returns 200 with updated order',
    async ({ request }) => {
      test.skip(!EXISTING_ORDER_ID, 'Set EXISTING_ORDER_ID in .env to enable');
      const response = await request.patch(`${API_BASE}/v1/orders/${EXISTING_ORDER_ID}`, {
        headers: authHeaders(),
        data: { status: 'CANCELLED' },
      });

      expect(response.status()).toBe(200);
      const body: unknown = await response.json();
      validateSchema(body, 'order-response.json');
    },
  );

  test(
    '[ORDP-02] @smoke Given no authorization, when partially updating an order, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.patch(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithoutAuth(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ORDP-03] @smoke Given non-existent order ID, when partially updated, then returns 404 not found',
    async ({ request }) => {
      const response = await request.patch(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[ORDP-04] @extended Given read-only scoped token, when partially updating an order, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.patch(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithReadOnlyToken(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ORDP-05] @extended Given throttled environment, when partially updating an order, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.patch(`${API_BASE}/v1/orders/some-order-id`, {
        headers: authHeaders(),
        data: { status: 'CANCELLED' },
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== DELETE /v1/orders/:order_id ====

test.describe('DELETE /v1/orders/:order_id', () => {
  test(
    '[ORDD-01] @extended Given existing order, when deleted with authorized credentials, then returns 200',
    async ({ request }) => {
      test.skip(!EXISTING_ORDER_ID, 'Set EXISTING_ORDER_ID in .env to enable — deletes the referenced order');
      const response = await request.delete(`${API_BASE}/v1/orders/${EXISTING_ORDER_ID}`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(200);
    },
  );

  test(
    '[ORDD-02] @smoke Given no authorization, when deleting an order, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ORDD-03] @smoke Given non-existent order ID, when deleted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.delete(`${API_BASE}/v1/orders/non-existent-id-99999`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[ORDD-04] @extended Given read-only scoped token, when deleting an order, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.delete(`${API_BASE}/v1/orders/some-order-id`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ORDD-05] @extended Given throttled environment, when deleting an order, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.delete(`${API_BASE}/v1/orders/some-order-id`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});
