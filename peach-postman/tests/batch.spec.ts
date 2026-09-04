import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const CREATE_BATCH_PAYLOAD = {
  filename: 'example filename',
  notificationUrl: 'https://webhook.example.com',
};

async function createBatch(apiContext: APIRequestContext): Promise<{ batchId: string; batchUrl: string }> {
  const response = await apiContext.post(`${API_BASE}/api/channels/test-entityId/payments/batches`, { data: CREATE_BATCH_PAYLOAD });
  const body = await response.json();
  return { batchId: body.id, batchUrl: body.url };
}

test.describe('batch API', () => {
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
    '[BA-33] @smoke Given valid parameters, when Create batch is requested, then returns 202 accepted',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/channels/test-entityId/payments/batches`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(202);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'batch-create-batch-202.schema.json');
    },
  );

  test(
    '[BA-34] @smoke Given no Authorization header is supplied, when Create batch is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/channels/test-entityId/payments/batches`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[BA-35] @smoke Given valid parameters, when Retrieve all batches is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/channels/test-entityId/payments/batches`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'batch-retrieve-all-batches-200.schema.json');
    },
  );

  test(
    '[BA-36] @smoke Given no Authorization header is supplied, when Retrieve all batches is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/channels/test-entityId/payments/batches`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[BA-37] @smoke Given a newly created batch, when Query batch status is requested, then returns 200 with matching batch id',
    { tag: ['@smoke'] },
    async () => {
      const { batchId } = await createBatch(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/batches/${batchId}`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'batch-query-batch-status-200.schema.json');
    },
  );

  test(
    '[BA-38] @smoke Given no Authorization header is supplied, when Query batch status is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/batches/test-batchId`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[BA-39] @smoke Given a newly created batch, when Retrieve batch error files is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const { batchId } = await createBatch(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/batches/${batchId}/files`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'batch-retrieve-batch-error-files-200.schema.json');
    },
  );

  test(
    '[BA-40] @smoke Given no Authorization header is supplied, when Retrieve batch error files is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/batches/test-batchId/files`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

});
