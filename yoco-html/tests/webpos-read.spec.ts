import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

async function createWebposDevice(apiContext: APIRequestContext): Promise<{ id: string }> {
  const response = await apiContext.post(`${API_BASE}/v1/webpos`, { data: { name: 'My Web POS' } });
  const body = await response.json();
  return { id: body.id };
}

async function createWebposPayment(apiContext: APIRequestContext, deviceId: string): Promise<{ id: string }> {
  const response = await apiContext.post(`${API_BASE}/v1/webpos/${deviceId}/payments`, {
    data: { amount: { amount: 200, currency: 'ZAR' }, client_reference: `ref-${Date.now()}` },
  });
  const body = await response.json();
  return { id: body.id };
}

test.describe('Web POS API (Read)', () => {
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
    '[YC-217] @smoke Given a newly created Web POS device, when get /v1/webpos/:webpos_device_id, then returns 200 with matching id',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createWebposDevice(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/${id}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-webpos--webpos-device-id-200.schema.json');
      expect(body.id).toBe(id);
    },
  );
  test(
    '[YC-218] @smoke Given no Authorization header is supplied, when get /v1/webpos/:webpos_device_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/webpos/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-219] @smoke Given error conditions for 401, when get /v1/webpos/:webpos_device_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-220] @extended Given error conditions for 403, when get /v1/webpos/:webpos_device_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-221] @smoke Given error conditions for 404, when get /v1/webpos/:webpos_device_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-222] @extended Given error conditions for 429, when get /v1/webpos/:webpos_device_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-223] @smoke Given a newly created Web POS device and payment, when get /v1/webpos/:webpos_device_id/payments/:payment_id, then returns 200 with matching payment id',
    { tag: ['@smoke'] },
    async () => {
      const { id: deviceId } = await createWebposDevice(apiContext);
      const { id: paymentId } = await createWebposPayment(apiContext, deviceId);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/${deviceId}/payments/${paymentId}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-webpos--webpos-device-id-payments--payment-id-200.schema.json');
      expect(body.id).toBe(paymentId);
    },
  );
  test(
    '[YC-224] @smoke Given no Authorization header is supplied, when get /v1/webpos/:webpos_device_id/payments/:payment_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/webpos/test-id-123/payments/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-225] @smoke Given error conditions for 401, when get /v1/webpos/:webpos_device_id/payments/:payment_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123/payments/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-226] @extended Given error conditions for 403, when get /v1/webpos/:webpos_device_id/payments/:payment_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123/payments/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-227] @smoke Given error conditions for 404, when get /v1/webpos/:webpos_device_id/payments/:payment_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123/payments/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-228] @extended Given error conditions for 429, when get /v1/webpos/:webpos_device_id/payments/:payment_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webpos/test-id-123/payments/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
