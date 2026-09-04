import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentLinkPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const EXISTING_PAYMENT_LINK_ID = process.env.EXISTING_PAYMENT_LINK_ID;

// ==== GET /v1/payment_links ====

test.describe('GET /v1/payment_links', () => {
  test(
    '[PL-01] @smoke Given authorized credentials, when listing payment links, then returns 200 with payment links list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payment-links-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[PL-02] @smoke Given no authorization, when listing payment links, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payment_links`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PL-03] @smoke Given invalid token, when listing payment links, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payment_links`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PL-04] @smoke Given invalid query parameter, when listing payment links, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/payment_links?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[PL-05] @extended Given read-only scoped token, when listing payment links, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/payment_links`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PL-06] @extended Given throttled environment, when listing payment links, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== POST /v1/payment_links ====

test.describe('POST /v1/payment_links', () => {
  test(
    '[PLC-01] @smoke Given valid payment link payload, when created with authorized credentials, then returns 201 with payment link details',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: makePaymentLinkPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(201);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payment-link-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[PLC-02] @smoke Given valid payment link payload, when submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: headersWithoutAuth(),
        data: makePaymentLinkPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PLC-03] @smoke Given empty request body, when payment link creation attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: {},
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[PLC-04] @smoke Given payment link payload, when submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: headersWithInvalidToken(),
        data: makePaymentLinkPayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PLC-05] @extended Given read-only scoped token, when creating payment link, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: headersWithReadOnlyToken(),
        data: makePaymentLinkPayload(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PLC-06] @extended Given throttled environment, when creating payment link, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: makePaymentLinkPayload(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/payment_links/:payment_link_id ====

test.describe('GET /v1/payment_links/:payment_link_id', () => {
  test(
    '[PLF-01] @smoke Given newly created payment link, when fetched by ID, then returns 200 with matching payment link',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: makePaymentLinkPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const paymentLinkId = created.id;

      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'payment-link-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(paymentLinkId);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[PLF-02] @smoke Given non-existent payment link ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payment_links/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[PLF-03] @smoke Given payment link ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PLF-04] @smoke Given payment link ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PLF-05] @extended Given read-only scoped token, when fetching payment link by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PLF-06] @extended Given throttled environment, when fetching payment link by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== DELETE /v1/payment_links/:payment_link_id ====

test.describe('DELETE /v1/payment_links/:payment_link_id', () => {
  test(
    '[PLD-01] @smoke Given existing payment link, when deleted with authorized credentials, then returns 200',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: makePaymentLinkPayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const paymentLinkId = created.id;

      const response = await request.delete(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(200);
    },
  );

  test(
    '[PLD-02] @smoke Given payment link ID, when delete submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PLD-03] @smoke Given non-existent payment link ID, when delete attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.delete(
        `${API_BASE}/v1/payment_links/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[PLD-04] @smoke Given payment link ID, when delete submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.delete(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[PLD-05] @extended Given read-only scoped token, when deleting payment link, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.delete(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[PLD-06] @extended Given throttled environment, when deleting payment link, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.delete(
        `${API_BASE}/v1/payment_links/some-link-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
