import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const CREATE_WEBHOOK_SUBSCRIPTION_PAYLOAD = {
  event_types: ['payment.created'],
  name: 'Example Webhook Subscription',
  notification_url: 'https://webhook.site/1d9d0c3c-c0f9-4def-8cf1-99efb5931eca',
};

async function createWebhookSubscription(apiContext: APIRequestContext): Promise<{ id: string }> {
  const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions`, { data: CREATE_WEBHOOK_SUBSCRIPTION_PAYLOAD });
  const body = await response.json();
  return { id: body.id };
}

test.describe('Webhook Subscriptions API', () => {
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
    '[YC-230] @smoke Given no Authorization header is supplied, when post /v1/webhooks/subscriptions, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-229] @smoke Given valid authorized credentials, when post /v1/webhooks/subscriptions, then returns 201 and echoes the subscription name',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions`, { data: CREATE_WEBHOOK_SUBSCRIPTION_PAYLOAD });
      const duration = Date.now() - start;
      expect(response.status()).toBe(201);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--v1-webhooks-subscriptions-201.schema.json');
      expect(body.name).toBe(CREATE_WEBHOOK_SUBSCRIPTION_PAYLOAD.name);
    },
  );
  test(
    '[YC-231] @smoke Given error conditions for 400, when post /v1/webhooks/subscriptions, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-232] @smoke Given error conditions for 401, when post /v1/webhooks/subscriptions, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-233] @extended Given error conditions for 403, when post /v1/webhooks/subscriptions, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-234] @extended Given error conditions for 429, when post /v1/webhooks/subscriptions, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-253] @smoke Given no Authorization header is supplied, when get /v1/webhooks/subscriptions, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-252] @smoke Given valid authorized credentials, when get /v1/webhooks/subscriptions, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-webhooks-subscriptions-200.schema.json');
    },
  );
  test(
    '[YC-254] @smoke Given error conditions for 400, when get /v1/webhooks/subscriptions, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-255] @smoke Given error conditions for 401, when get /v1/webhooks/subscriptions, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-256] @extended Given error conditions for 403, when get /v1/webhooks/subscriptions, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-257] @extended Given error conditions for 429, when get /v1/webhooks/subscriptions, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
