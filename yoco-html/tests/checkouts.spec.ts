import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const CREATE_CHECKOUT_PAYLOAD = { amount: 10000, currency: 'ZAR' };

async function createCheckout(apiContext: APIRequestContext): Promise<{ id: string }> {
  const response = await apiContext.post(`${API_BASE}/api/checkouts`, { data: CREATE_CHECKOUT_PAYLOAD });
  const body = await response.json();
  return { id: body.id };
}

test.describe('Checkouts API', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test(
    '[YC-01] @smoke Given valid authorized credentials, when post /api/checkouts, then returns 200 and echoes the requested amount',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts`, { data: CREATE_CHECKOUT_PAYLOAD });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--api-checkouts-200.schema.json');
      expect(body.amount).toBe(CREATE_CHECKOUT_PAYLOAD.amount);
      expect(body.currency).toBe(CREATE_CHECKOUT_PAYLOAD.currency);
    },
  );
  test(
    '[YC-02] @smoke Given no Authorization header is supplied, when post /api/checkouts, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/checkouts`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-03] @extended Given error conditions for 403, when post /api/checkouts, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-04] @extended Given error conditions for 409, when post /api/checkouts, then returns 409 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(409);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-05] @extended Given error conditions for 422, when post /api/checkouts, then returns 422 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(422);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-06] @smoke Given a newly created checkout, when post /api/checkouts/:id/refund, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createCheckout(apiContext);
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts/${id}/refund`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--api-checkouts--id-refund-200.schema.json');
    },
  );
  test(
    '[YC-07] @smoke Given no Authorization header is supplied, when post /api/checkouts/:id/refund, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/checkouts/test-id-123/refund`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-08] @extended Given error conditions for 403, when post /api/checkouts/:id/refund, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts/test-id-123/refund`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-09] @extended Given error conditions for 409, when post /api/checkouts/:id/refund, then returns 409 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts/test-id-123/refund`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(409);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-10] @extended Given error conditions for 422, when post /api/checkouts/:id/refund, then returns 422 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/checkouts/test-id-123/refund`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(422);
      expect(duration).toBeLessThan(5000);
    },
  );
});
