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

test.describe('Webhook Subscription Send Test Event API', () => {
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
    '[YC-265] @smoke Given a newly created webhook subscription, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 200 with a message id',
    { tag: ['@smoke'] },
    async () => {
      const { id } = await createWebhookSubscription(apiContext);
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions/${id}/test`, { data: { event_type: 'payment.created' } });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'post--v1-webhooks-subscriptions--subscription-id-test-200.schema.json');
      expect(body.message_id).toEqual(expect.any(String));
    },
  );
  test(
    '[YC-266] @smoke Given no Authorization header is supplied, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v1/webhooks/subscriptions/test-id-123/test`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
  test(
    '[YC-267] @smoke Given error conditions for 400, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 400 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions/test-id-123/test`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(400);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-268] @smoke Given error conditions for 401, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 401 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions/test-id-123/test`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-269] @extended Given error conditions for 403, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 403 error',
    { tag: ['@extended'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions/test-id-123/test`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(403);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-270] @smoke Given error conditions for 404, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 404 error',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions/test-id-123/test`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(404);
      expect(duration).toBeLessThan(5000);
    },
  );
  test(
    '[YC-271] @extended Given error conditions for 429, when post /v1/webhooks/subscriptions/:subscription_id/test, then returns 429 error',
    { tag: ['@extended'] },
    async () => {
      test.skip(!process.env.TEST_RATE_LIMITS, 'Needs specific environment to trigger rate limits');
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v1/webhooks/subscriptions/test-id-123/test`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(429);
      expect(duration).toBeLessThan(5000);
    },
  );
});
