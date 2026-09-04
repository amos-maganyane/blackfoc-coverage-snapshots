import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

test.describe('Legacy Webhooks API', () => {
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
    '[YC-11] @smoke Given valid authorized credentials, when delete /api/webhooks/:id, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/api/webhooks/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'delete--api-webhooks--id-200.schema.json');
    },
  );
  test(
    '[YC-12] @smoke Given no Authorization header is supplied, when delete /api/webhooks/:id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.delete(`${API_BASE}/api/webhooks/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-13] @smoke Given error conditions for 400, when delete /api/webhooks/:id, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/api/webhooks/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-14] @extended Given error conditions for 403, when delete /api/webhooks/:id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/api/webhooks/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-15] @smoke Given valid authorized credentials, when get /api/webhooks, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--api-webhooks-200.schema.json');
    },
  );
  test(
    '[YC-16] @smoke Given no Authorization header is supplied, when get /api/webhooks, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-17] @smoke Given error conditions for 400, when get /api/webhooks, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-18] @extended Given error conditions for 403, when get /api/webhooks, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-19] @smoke Given valid authorized credentials, when post /api/webhooks, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--api-webhooks-200.schema.json');
    },
  );
  test(
    '[YC-20] @smoke Given no Authorization header is supplied, when post /api/webhooks, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-21] @smoke Given error conditions for 400, when post /api/webhooks, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-22] @extended Given error conditions for 403, when post /api/webhooks, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/webhooks`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
});
