import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

const CREATE_PAYOUT_PAYLOAD = {
  payouts: [
    { accountHolder: 'Test Holder', reference: 'test-ref', branchCode: '111111', bankName: 'ABSA', accountNumber: '1111111111', amount: 1000, currency: 'ZAR', payoutMethod: 'realtime-eft' },
  ],
};

const CREATE_BANK_VERIFICATION_PAYLOAD = {
  accountNumber: '7700000013',
  accountType: 'current_cheque_account',
  branchCode: '250655',
  idNumber: '9901017514183',
  initials: 'J',
  lastName: 'Doe',
};

async function createPayout(apiContext: APIRequestContext): Promise<{ payoutRequestId: string }> {
  const response = await apiContext.post(`${API_BASE}/api/merchants/test-merchantId/payouts`, { data: CREATE_PAYOUT_PAYLOAD });
  const body = await response.json();
  return { payoutRequestId: body.payoutRequestId };
}

async function createBankVerification(apiContext: APIRequestContext): Promise<{ bankVerificationId: string }> {
  const response = await apiContext.post(`${API_BASE}/api/merchants/test-merchantId/banv`, { data: CREATE_BANK_VERIFICATION_PAYLOAD });
  const body = await response.json();
  return { bankVerificationId: body.bankVerificationId };
}

test.describe('api API', () => {
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
    '[AP-49] @smoke Given valid parameters, when Create payouts is requested, then returns 201 created',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/merchants/test-merchantId/payouts`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(201);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-create-payouts-201.schema.json');
    },
  );

  test(
    '[AP-50] @smoke Given no Authorization header is supplied, when Create payouts is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/merchants/test-merchantId/payouts`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-51] @smoke Given valid parameters, when List payouts is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/payouts`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-list-payouts-200.schema.json');
    },
  );

  test(
    '[AP-52] @smoke Given no Authorization header is supplied, when List payouts is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/payouts`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-53] @smoke Given a newly created payout, when Query payout is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const { payoutRequestId } = await createPayout(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/payouts/${payoutRequestId}/status`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-query-payout-200.schema.json');
    },
  );

  test(
    '[AP-54] @smoke Given no Authorization header is supplied, when Query payout is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/payouts/test-payoutRequestId/status`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-55] @smoke Given valid parameters, when Create bank account verification is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.post(`${API_BASE}/api/merchants/test-merchantId/banv`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-create-bank-account-verification-200.schema.json');
    },
  );

  test(
    '[AP-56] @smoke Given no Authorization header is supplied, when Create bank account verification is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.post(`${API_BASE}/api/merchants/test-merchantId/banv`, { data: {} });
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-57] @smoke Given a newly created bank verification, when Bank account verification status is requested, then returns 200 with matching bankVerificationId',
    { tag: ['@smoke'] },
    async () => {
      const { bankVerificationId } = await createBankVerification(apiContext);
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/banv/${bankVerificationId}/status`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-bank-account-verification-status-200.schema.json');
      expect(body.bankVerificationId).toBe(bankVerificationId);
    },
  );

  test(
    '[AP-58] @smoke Given no Authorization header is supplied, when Bank account verification status is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/banv/test-bankVerificationId/status`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-59] @smoke Given valid parameters, when Retrieve balance is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/balance`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-retrieve-balance-200.schema.json');
    },
  );

  test(
    '[AP-60] @smoke Given no Authorization header is supplied, when Retrieve balance is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/balance`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-61] @smoke Given valid parameters, when Transaction report is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/reports/payouts/download`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-transaction-report-200.schema.json');
    },
  );

  test(
    '[AP-62] @smoke Given no Authorization header is supplied, when Transaction report is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/reports/payouts/download`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-63] @smoke Given valid parameters, when Statement report is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/reports/statement/download`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-statement-report-200.schema.json');
    },
  );

  test(
    '[AP-64] @smoke Given no Authorization header is supplied, when Statement report is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/reports/statement/download`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

  test(
    '[AP-65] @smoke Given valid parameters, when List merchant transactions recon is requested, then returns 200 with result code',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/api/merchants/test-merchantId/transactions-recon`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'api-list-merchant-transactions-recon-200.schema.json');
    },
  );

  test(
    '[AP-66] @smoke Given no Authorization header is supplied, when List merchant transactions recon is requested, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/api/merchants/test-merchantId/transactions-recon`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );

});
