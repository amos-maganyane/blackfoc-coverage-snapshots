import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

test.describe('Locations API', () => {
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
    '[YC-89] @smoke Given valid authorized credentials, when get /v1/locations/:location_id, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-locations--location-id-200.schema.json');
    },
  );
  test(
    '[YC-90] @smoke Given no Authorization header is supplied, when get /v1/locations/:location_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/locations/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-91] @smoke Given error conditions for 401, when get /v1/locations/:location_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-92] @extended Given error conditions for 403, when get /v1/locations/:location_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-93] @smoke Given error conditions for 404, when get /v1/locations/:location_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-94] @extended Given error conditions for 429, when get /v1/locations/:location_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-95] @smoke Given valid authorized credentials, when get /v1/locations, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-locations-200.schema.json');
    },
  );
  test(
    '[YC-96] @smoke Given no Authorization header is supplied, when get /v1/locations, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/locations`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-97] @smoke Given error conditions for 400, when get /v1/locations, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-98] @smoke Given error conditions for 401, when get /v1/locations, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-99] @extended Given error conditions for 403, when get /v1/locations, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-100] @extended Given error conditions for 429, when get /v1/locations, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/locations`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
