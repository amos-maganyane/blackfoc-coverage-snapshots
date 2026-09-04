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

test.describe('Webhook Subscription Item API', () => {
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
    '[YC-235] @smoke Given a newly created webhook subscription, when delete /v1/webhooks/subscriptions/:subscription_id, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createWebhookSubscription(apiContext);
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/webhooks/subscriptions/${id}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'delete--v1-webhooks-subscriptions--subscription-id-200.schema.json');
    },
  );
  test(
    '[YC-236] @smoke Given no Authorization header is supplied, when delete /v1/webhooks/subscriptions/:subscription_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.delete(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-237] @smoke Given error conditions for 401, when delete /v1/webhooks/subscriptions/:subscription_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-238] @extended Given error conditions for 403, when delete /v1/webhooks/subscriptions/:subscription_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-239] @smoke Given error conditions for 404, when delete /v1/webhooks/subscriptions/:subscription_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-240] @extended Given error conditions for 429, when delete /v1/webhooks/subscriptions/:subscription_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-241] @smoke Given a newly created webhook subscription, when get /v1/webhooks/subscriptions/:subscription_id, then returns 200 with matching id',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createWebhookSubscription(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions/${id}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--v1-webhooks-subscriptions--subscription-id-200.schema.json');
      expect(body.id).toBe(id);
    },
  );
  test(
    '[YC-242] @smoke Given no Authorization header is supplied, when get /v1/webhooks/subscriptions/:subscription_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-243] @smoke Given error conditions for 401, when get /v1/webhooks/subscriptions/:subscription_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-244] @extended Given error conditions for 403, when get /v1/webhooks/subscriptions/:subscription_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-245] @smoke Given error conditions for 404, when get /v1/webhooks/subscriptions/:subscription_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-246] @extended Given error conditions for 429, when get /v1/webhooks/subscriptions/:subscription_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-272] @smoke Given a newly created webhook subscription, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 200 with matching id',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createWebhookSubscription(apiContext);
      const start = Date.now();
      const response = await apiContext.patch(`${API_BASE}/v1/webhooks/subscriptions/${id}`, { data: { enabled: false } });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'patch--v1-webhooks-subscriptions--subscription-id-200.schema.json');
      expect(body.id).toBe(id);
      expect(body.enabled).toBe(false);
    },
  );
  test(
    '[YC-273] @smoke Given no Authorization header is supplied, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.patch(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-274] @smoke Given error conditions for 400, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.patch(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-275] @smoke Given error conditions for 401, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.patch(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-276] @extended Given error conditions for 403, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.patch(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-277] @smoke Given error conditions for 404, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.patch(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-278] @extended Given error conditions for 429, when patch /v1/webhooks/subscriptions/:subscription_id, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.patch(`${API_BASE}/v1/webhooks/subscriptions/test-id-123`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
