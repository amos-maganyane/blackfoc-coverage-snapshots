import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const GENERATE_LINK_PAYLOAD = {
  payment: { merchantInvoiceId: 'inv-001', amount: 10.0, currency: 'ZAR', files: [], notes: 'Test payment link' },
  customer: {
    givenName: 'Test',
    surname: 'User',
    email: 'test.user@example.com',
    mobile: '+27821234567',
    whatsapp: '+27821234567',
    billing: { street1: '1 Main Street', city: 'Cape Town', state: 'Western Cape', postalCode: '8001', country: 'ZA' },
  },
  options: { sendEmail: false, sendSms: false, sendWhatsapp: false, expiryTime: 5 },
  checkout: { defaultPaymentMethod: 'CARD', forceDefaultMethod: true, paymentType: 'DB', tokeniseCard: true },
};

async function createPaymentLink(apiContext: APIRequestContext): Promise<{ paymentId: string }> {
  const response = await apiContext.post(`${API_BASE}/api/channels/test-entityId/payments`, { data: GENERATE_LINK_PAYLOAD });
  const body = await response.json();
  return { paymentId: body.id };
}

async function uploadFile(apiContext: APIRequestContext): Promise<{ fileId: string }> {
  const response = await apiContext.post(`${API_BASE}/api/attachments`, {
    multipart: { file: { name: 'test.txt', mimeType: 'text/plain', buffer: Buffer.from('test attachment content') } },
  });
  const body = await response.json();
  return { fileId: body.fileId };
}

test.describe('links API', () => {
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
    '[LI-21] @smoke Given valid parameters, when Upload a file is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/attachments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'links-upload-a-file-200.schema.json');
    },
  );

  test(
    '[LI-22] @smoke Given no Authorization header is supplied, when Upload a file is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/attachments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[LI-23] @smoke Given valid parameters, when Generate link is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/channels/test-entityId/payments`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'links-generate-link-200.schema.json');
    },
  );

  test(
    '[LI-24] @smoke Given no Authorization header is supplied, when Generate link is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/channels/test-entityId/payments`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[LI-25] @smoke Given valid parameters, when Export all merchant payment links is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'links-export-all-merchant-payment-links-200.schema.json');
    },
  );

  test(
    '[LI-26] @smoke Given no Authorization header is supplied, when Export all merchant payment links is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/payments`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[LI-27] @smoke Given a newly generated payment link, when Cancel link is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const { paymentId } = await createPaymentLink(apiContext);
      const start = Date.now();
      const response = await apiContext.delete(`${API_BASE}/api/payments/${paymentId}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'links-cancel-link-200.schema.json');
    },
  );

  test(
    '[LI-28] @smoke Given no Authorization header is supplied, when Cancel link is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.delete(`${API_BASE}/api/payments/test-paymentId`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[LI-29] @smoke Given a newly generated payment link, when Query payment status is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const { paymentId } = await createPaymentLink(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/payments/${paymentId}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'links-query-payment-status-200.schema.json');
    },
  );

  test(
    '[LI-30] @smoke Given no Authorization header is supplied, when Query payment status is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/payments/test-paymentId`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[LI-31] @smoke Given a newly generated payment link and uploaded file, when Download a file is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const { paymentId } = await createPaymentLink(apiContext);
      const { fileId } = await uploadFile(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/payments/${paymentId}/files/${fileId}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'links-download-a-file-200.schema.json');
    },
  );

  test(
    '[LI-32] @smoke Given no Authorization header is supplied, when Download a file is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/payments/test-paymentId/files/test-fileId`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

});
