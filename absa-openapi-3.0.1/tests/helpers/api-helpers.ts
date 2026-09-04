import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { authHeaders } from './auth';
import { validateSchema } from './schema-validator';
import { makeConsentPayload, makePaymentPayload, type PaymentPayload } from './test-data';

export type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function parseJsonRecord(response: APIResponse): Promise<JsonRecord> {
  const body: unknown = await response.json();
  if (!isRecord(body)) {
    throw new Error('Expected JSON object response body');
  }

  return body;
}

function getDataRecord(body: JsonRecord): JsonRecord {
  const data = body.Data;
  if (!isRecord(data)) {
    throw new Error('Expected Data object in response body');
  }

  return data;
}

export function getDataString(body: JsonRecord, field: string): string {
  const data = getDataRecord(body);
  const value = data[field];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Expected Data.${field} to be a non-empty string`);
  }

  return value;
}

export function getDataBoolean(body: JsonRecord, field: string): boolean {
  const data = getDataRecord(body);
  const value = data[field];
  if (typeof value !== 'boolean') {
    throw new Error(`Expected Data.${field} to be a boolean`);
  }

  return value;
}

export function readOnlyTokenOrSkip(): string {
  const token = process.env.API_TOKEN_READ_ONLY;
  test.skip(!token, 'Skipped: set API_TOKEN_READ_ONLY to execute forbidden-scope tests');
  return token ?? '';
}

export function preExistingConsentIdOrSkip(): string {
  const consentId = process.env.TEST_CONSENT_ID;
  test.skip(!consentId, 'Skipped: set TEST_CONSENT_ID to test against a pre-existing consent');
  return consentId ?? '';
}

export function preExistingPaymentIdOrSkip(): string {
  const paymentId = process.env.TEST_PAYMENT_ID;
  test.skip(!paymentId, 'Skipped: set TEST_PAYMENT_ID to test against a pre-existing payment');
  return paymentId ?? '';
}

export async function createConsent(request: APIRequestContext): Promise<{ body: JsonRecord; consentId: string }> {
  const response = await request.post('/domestic-payment-consents', {
    headers: authHeaders(),
    data: makeConsentPayload(),
  });

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'] ?? '').toContain('application/json');

  const body = await parseJsonRecord(response);
  validateSchema(body, 'consent-create-response.json');

  return {
    body,
    consentId: getDataString(body, 'ConsentId'),
  };
}

export async function createPayment(
  request: APIRequestContext,
  consentId?: string,
): Promise<{ body: JsonRecord; consentId: string; domesticPaymentId: string; payload: PaymentPayload }> {
  const resolvedConsentId = consentId ?? (await createConsent(request)).consentId;
  const payload = makePaymentPayload(resolvedConsentId);
  const response = await request.post('/domestic-payments', {
    headers: authHeaders(),
    data: payload,
  });

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'] ?? '').toContain('application/json');

  const body = await parseJsonRecord(response);
  validateSchema(body, 'payment-create-response.json');

  return {
    body,
    consentId: getDataString(body, 'ConsentId'),
    domesticPaymentId: getDataString(body, 'DomesticPaymentId'),
    payload,
  };
}
