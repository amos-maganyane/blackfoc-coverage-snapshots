import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

async function createWebposDevice(apiContext: APIRequestContext): Promise<{ id: string }> {
  const response = await apiContext.post(`${API_BASE}/v1/webpos`, { data: { name: 'My Web POS' } });
  const body = await response.json();
  return { id: body.id };
}

test.describe('Web POS API (Write)', () => {
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
    '[YC-205] @smoke Given valid authorized credentials, when post /v1/webpos, then returns 201 and echoes the device name',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos`, { data: { name: 'My Web POS' } });
      const duration = Date.now() - start;
      expect(response.status()).toBe(201);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--v1-webpos-201.schema.json');
      expect(body.name).toBe('My Web POS');
    },
  );
  test(
    '[YC-206] @smoke Given no Authorization header is supplied, when post /v1/webpos, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v1/webpos`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-207] @smoke Given error conditions for 400, when post /v1/webpos, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-208] @smoke Given error conditions for 401, when post /v1/webpos, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-209] @extended Given error conditions for 403, when post /v1/webpos, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-210] @extended Given error conditions for 429, when post /v1/webpos, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-211] @smoke Given a newly created Web POS device, when post /v1/webpos/:webpos_device_id/payments, then returns 201 success',
    { tag: ['@smoke'] },
    async () => {
      const { id: deviceId } = await createWebposDevice(apiContext);
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos/${deviceId}/payments`, {
        data: { amount: { amount: 200, currency: 'ZAR' }, client_reference: `ref-${Date.now()}` },
      });
      const duration = Date.now() - start;
      expect(response.status()).toBe(201);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--v1-webpos--webpos-device-id-payments-201.schema.json');
      expect(body.webpos_device_id).toBe(deviceId);
    },
  );
  test(
    '[YC-212] @smoke Given no Authorization header is supplied, when post /v1/webpos/:webpos_device_id/payments, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v1/webpos/test-id-123/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-213] @smoke Given error conditions for 400, when post /v1/webpos/:webpos_device_id/payments, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos/test-id-123/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-214] @smoke Given error conditions for 401, when post /v1/webpos/:webpos_device_id/payments, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos/test-id-123/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-215] @extended Given error conditions for 403, when post /v1/webpos/:webpos_device_id/payments, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos/test-id-123/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-216] @extended Given error conditions for 429, when post /v1/webpos/:webpos_device_id/payments, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webpos/test-id-123/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
