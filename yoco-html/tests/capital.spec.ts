import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

test.describe('Capital API', () => {
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
    '[YC-31] @smoke Given valid authorized credentials, when get /v1/capital/active_advances, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_advances`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-capital-active-advances-200.schema.json');
    },
  );
  test(
    '[YC-32] @smoke Given no Authorization header is supplied, when get /v1/capital/active_advances, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/capital/active_advances`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-33] @smoke Given error conditions for 401, when get /v1/capital/active_advances, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_advances`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-34] @extended Given error conditions for 403, when get /v1/capital/active_advances, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_advances`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-35] @extended Given error conditions for 429, when get /v1/capital/active_advances, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_advances`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-36] @smoke Given valid authorized credentials, when get /v1/capital/active_offers, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_offers`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-capital-active-offers-200.schema.json');
    },
  );
  test(
    '[YC-37] @smoke Given no Authorization header is supplied, when get /v1/capital/active_offers, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/capital/active_offers`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-38] @smoke Given error conditions for 401, when get /v1/capital/active_offers, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_offers`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-39] @extended Given error conditions for 403, when get /v1/capital/active_offers, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_offers`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-40] @extended Given error conditions for 429, when get /v1/capital/active_offers, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/capital/active_offers`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
