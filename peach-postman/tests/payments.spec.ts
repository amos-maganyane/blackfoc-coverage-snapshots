import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

function makePaymentPayload(merchantTransactionId: string) {
  return {
    authentication: { userId: 'test-user', password: 'test-password', entityId: 'test-entityId' },
    merchantTransactionId,
    amount: '10.00',
    currency: 'ZAR',
    paymentBrand: 'PEACHEFT',
    paymentType: 'DB',
    shopperResultUrl: 'https://example.com/result',
  };
}

async function createPayment(apiContext: APIRequestContext): Promise<{ transactionId: string; merchantTransactionId: string }> {
  const merchantTransactionId = `INV-${Date.now()}`;
  const response = await apiContext.post(`${API_BASE}/payments`, { data: makePaymentPayload(merchantTransactionId) });
  const body = await response.json();
  return { transactionId: body.id, merchantTransactionId: body.merchantTransactionId };
}

test.describe('payments API', () => {
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
    '[PA-41] @smoke Given valid parameters, when Payment is requested, then returns 200 and echoes the same merchantTransactionId',
    { tag: ['@smoke'] },
    async () => {
      const merchantTransactionId = `INV-${Date.now()}`;
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/payments`, { data: makePaymentPayload(merchantTransactionId) });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'payments-payment-200.schema.json');
      expect(body.merchantTransactionId).toBe(merchantTransactionId);
    },
  );

  test(
    '[PA-42] @smoke Given no Authorization header is supplied, when Payment is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/payments`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[PA-43] @smoke Given a newly created payment, when Query transaction by merchantTransactionId is requested, then returns 200 with matching transaction',
    { tag: ['@smoke'] },
    async () => {
      const { merchantTransactionId } = await createPayment(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/payments`, { params: { merchantTransactionId } });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'payments-query-transaction-by-merchanttransactionid-200.schema.json');
    },
  );

  test(
    '[PA-44] @smoke Given no Authorization header is supplied, when Query transaction by merchantTransactionId is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[PA-45] @smoke Given a newly created payment, when Query transaction by transaction ID is requested, then returns 200 with matching transaction',
    { tag: ['@smoke'] },
    async () => {
      const { transactionId } = await createPayment(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/payments/${transactionId}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'payments-query-transaction-by-transaction-id-200.schema.json');
    },
  );

  test(
    '[PA-46] @smoke Given no Authorization header is supplied, when Query transaction by transaction ID is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/payments/test-transactionId`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[PA-47] @smoke Given a newly created payment, when Refund transaction is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const { transactionId } = await createPayment(apiContext);
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/payments/${transactionId}`, {
        data: {
          authentication: { userId: 'test-user', password: 'test-password', entityId: 'test-entityId' },
          amount: '20.00',
          currency: 'ZAR',
          paymentType: 'RF',
        },
      });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'payments-refund-transaction-200.schema.json');
    },
  );

  test(
    '[PA-48] @smoke Given no Authorization header is supplied, when Refund transaction is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/payments/test-transactionId`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

});
