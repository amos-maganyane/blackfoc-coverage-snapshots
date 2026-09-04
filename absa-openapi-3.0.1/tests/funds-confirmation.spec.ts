import { expect, test } from '@playwright/test';
import { authHeaders, headersWithInvalidToken, headersWithoutAuth } from './helpers/auth';
import {
  createConsent,
  getDataBoolean,
  parseJsonRecord,
  preExistingConsentIdOrSkip,
  readOnlyTokenOrSkip,
} from './helpers/api-helpers';
import { validateSchema } from './helpers/schema-validator';

test.describe('GET /domestic-payment-consents/{consentId}/funds-confirmation', () => {
  test('[FC-01] @smoke Given newly created consent, when funds confirmation retrieved, then returns 200 with funds confirmation data', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const start = Date.now();
    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');

    const body = await parseJsonRecord(response);
    validateSchema(body, 'funds-confirmation-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[FC-02] @smoke Given newly created consent, when funds confirmation retrieved, then response includes FundsAvailable boolean', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(typeof getDataBoolean(body, 'FundsAvailable')).toBe('boolean');
  });

  test('[FC-03] @smoke Given any consent identifier, when funds confirmation requested without authorization header, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get('/domestic-payment-consents/any-consent-id/funds-confirmation', {
      headers: headersWithoutAuth(),
    });

    expect(response.status()).toBe(401);
  });

  test('[FC-04] @smoke Given any consent identifier, when funds confirmation requested with expired bearer token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get('/domestic-payment-consents/any-consent-id/funds-confirmation', {
      headers: headersWithInvalidToken(),
    });

    expect(response.status()).toBe(401);
  });

  test('[FC-05] @smoke Given malformed consent identifier, when funds confirmation requested, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`/domestic-payment-consents/${encodeURIComponent('<bad-id>')}/funds-confirmation`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(400);
  });

  test('[FC-06] @extended Given read-only scoped credentials, when funds confirmation requested, then returns 403 forbidden', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const readOnlyToken = readOnlyTokenOrSkip();
    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders({ Authorization: `Bearer ${readOnlyToken}` }),
    });

    expect(response.status()).toBe(403);
  });

  test('[FC-07] @smoke Given previously used nonce for funds confirmation, when the same request replayed, then returns 412 precondition failed', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const replayedNonce = 'fixed-replay-nonce-funds-confirmation';

    const firstResponse = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
    });

    expect(firstResponse.status()).toBe(200);

    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
    });

    expect(response.status()).toBe(412);
  });

  test('[FC-08] @extended Given rate-limited environment, when funds confirmation requested, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true to execute rate limit test');

    const { consentId } = await createConsent(request);
    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
  });

  test('[FC-EXT-01] @extended Given pre-existing consent in TEST_CONSENT_ID, when funds confirmation retrieved, then returns 200 with funds confirmation data', async ({ request }) => {
    const consentId = preExistingConsentIdOrSkip();
    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(typeof getDataBoolean(body, 'FundsAvailable')).toBe('boolean');
  });
});
