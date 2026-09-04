import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const CREATE_PAYMENT_LINK_PAYLOAD = {
  amount: { amount: 1500, currency: 'ZAR' },
  customer_reference: 'Test Customer',
  customer_description: 'Automated test payment link',
};

async function createPaymentLink(apiContext: APIRequestContext): Promise<{ id: string }> {
  const response = await apiContext.post(`${API_BASE}/v1/payment_links`, { data: CREATE_PAYMENT_LINK_PAYLOAD });
  const body = await response.json();
  return { id: body.id };
}

test.describe('Payment Links API (Write)', () => {
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
    '[YC-127] @smoke Given valid authorized credentials, when post /v1/payment_links, then returns 201 and echoes the customer_reference',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/payment_links`, { data: CREATE_PAYMENT_LINK_PAYLOAD });
      const duration = Date.now() - start;
      expect(response.status()).toBe(201);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--v1-payment-links-201.schema.json');
      expect(body.customer_reference).toBe(CREATE_PAYMENT_LINK_PAYLOAD.customer_reference);
    },
  );
  test(
    '[YC-128] @smoke Given no Authorization header is supplied, when post /v1/payment_links, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v1/payment_links`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-129] @smoke Given error conditions for 400, when post /v1/payment_links, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/payment_links`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-130] @smoke Given error conditions for 401, when post /v1/payment_links, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/payment_links`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-131] @extended Given error conditions for 403, when post /v1/payment_links, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/payment_links`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-132] @extended Given error conditions for 429, when post /v1/payment_links, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/payment_links`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-133] @smoke Given a newly created payment link, when delete /v1/payment_links/:payment_link_id, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createPaymentLink(apiContext);
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/payment_links/${id}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'delete--v1-payment-links--payment-link-id-200.schema.json');
    },
  );
  test(
    '[YC-134] @smoke Given no Authorization header is supplied, when delete /v1/payment_links/:payment_link_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.delete(`${API_BASE}/v1/payment_links/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-135] @smoke Given error conditions for 401, when delete /v1/payment_links/:payment_link_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/payment_links/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-136] @extended Given error conditions for 403, when delete /v1/payment_links/:payment_link_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/payment_links/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-137] @smoke Given error conditions for 404, when delete /v1/payment_links/:payment_link_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/payment_links/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-138] @extended Given error conditions for 429, when delete /v1/payment_links/:payment_link_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/payment_links/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
