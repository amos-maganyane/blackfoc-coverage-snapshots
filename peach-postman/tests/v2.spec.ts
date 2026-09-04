import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const GENERATE_CHECKOUT_ID_PAYLOAD = {
  authentication: { entityId: 'test-entityId' },
  amount: 10.0,
  currency: 'ZAR',
  shopperResultUrl: 'https://example.com/result',
  merchantTransactionId: 'INV-001',
  merchantInvoiceId: 'INV-0001',
  customer: { merchantCustomerId: '1', givenName: 'Test', surname: 'User', mobile: '+27821234567', email: 'test.user@example.com', idNumber: '1111111111111' },
  billing: { street1: '1 Main Street', city: 'Cape Town', country: 'ZA', state: 'WC', postcode: '8001' },
};

async function createCheckoutV2(apiContext: APIRequestContext): Promise<{ checkoutId: string }> {
  const response = await apiContext.post(`${API_BASE}/v2/checkout`, { data: GENERATE_CHECKOUT_ID_PAYLOAD });
  const body = await response.json();
  return { checkoutId: body.checkoutId };
}

test.describe('v2 API', () => {
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
    '[V2-11] @smoke Given valid parameters, when Retrieve a list of payment methods for a currency is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v2/channels/test-entityId/payment-methods`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'v2-retrieve-a-list-of-payment-methods-for-a-currency-200.schema.json');
    },
  );

  test(
    '[V2-12] @smoke Given no Authorization header is supplied, when Retrieve a list of payment methods for a currency is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v2/channels/test-entityId/payment-methods`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[V2-13] @smoke Given valid parameters, when Generate Checkout ID is requested, then returns 200 with a non-empty checkoutId',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v2/checkout`, { data: GENERATE_CHECKOUT_ID_PAYLOAD });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'v2-generate-checkout-id-200.schema.json');
      expect(body.checkoutId).not.toBe('');
    },
  );

  test(
    '[V2-14] @smoke Given no Authorization header is supplied, when Generate Checkout ID is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v2/checkout`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[V2-15] @smoke Given valid parameters, when Validate Checkout request is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/v2/checkout/validate`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'v2-validate-checkout-request-200.schema.json');
    },
  );

  test(
    '[V2-16] @smoke Given no Authorization header is supplied, when Validate Checkout request is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/v2/checkout/validate`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[V2-17] @smoke Given a newly generated checkout, when Query Checkout status v2 is requested, then returns 200 with matching checkoutId',
    { tag: ['@smoke'] },
    async () => {
      const { checkoutId } = await createCheckoutV2(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/v2/checkout/${checkoutId}/status`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'v2-query-checkout-status-v2-200.schema.json');
      expect(body.checkoutId).not.toBe('');
    },
  );

  test(
    '[V2-18] @smoke Given no Authorization header is supplied, when Query Checkout status v2 is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/v2/checkout/test-checkoutId/status`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[V2-19] @smoke Given valid parameters, when Merchant Access is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/oauth/token`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'v2-merchant-access-200.schema.json');
    },
  );

  test(
    '[V2-20] @smoke Given no Authorization header is supplied, when Merchant Access is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/oauth/token`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

});
