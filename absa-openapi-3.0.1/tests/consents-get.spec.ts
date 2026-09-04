import { expect, test } from '@playwright/test';
import { authHeaders, headersWithInvalidToken, headersWithoutAuth } from './helpers/auth';
import {
  createConsent,
  getDataString,
  parseJsonRecord,
  preExistingConsentIdOrSkip,
  readOnlyTokenOrSkip,
} from './helpers/api-helpers';
import { validateSchema } from './helpers/schema-validator';

test.describe('GET /domestic-payment-consents/{consentId}', () => {
  test('[DC-12] @smoke Given newly created consent, when retrieved by ConsentId, then returns 200 with matching consent data', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const start = Date.now();
    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');

    const body = await parseJsonRecord(response);
    validateSchema(body, 'consent-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[DC-13] @smoke Given newly created consent, when retrieved by ConsentId, then response echoes the same ConsentId', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(getDataString(body, 'ConsentId')).toBe(consentId);
  });

  test('[DC-14] @smoke Given any consent identifier, when consent retrieved without authorization header, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get('/domestic-payment-consents/any-consent-id', {
      headers: headersWithoutAuth(),
    });

    expect(response.status()).toBe(401);
  });

  test('[DC-15] @smoke Given any consent identifier, when consent retrieved with expired bearer token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get('/domestic-payment-consents/any-consent-id', {
      headers: headersWithInvalidToken(),
    });

    expect(response.status()).toBe(401);
  });

  test('[DC-16] @smoke Given malformed consent identifier, when consent retrieval attempted, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`/domestic-payment-consents/${encodeURIComponent('<invalid>')}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(400);
  });

  test('[DC-17] @extended Given read-only scoped credentials, when consent retrieval attempted, then returns 403 forbidden', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const readOnlyToken = readOnlyTokenOrSkip();
    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders({ Authorization: `Bearer ${readOnlyToken}` }),
    });

    expect(response.status()).toBe(403);
  });

  test('[DC-18] @smoke Given previously used nonce for consent retrieval, when the same request replayed, then returns 412 precondition failed', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const replayedNonce = 'fixed-replay-nonce-consent-get';

    const firstResponse = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
    });

    expect(firstResponse.status()).toBe(200);

    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
    });

    expect(response.status()).toBe(412);
  });

  test('[DC-19] @extended Given rate-limited environment, when consent retrieval attempted, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true to execute rate limit test');

    const { consentId } = await createConsent(request);
    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
  });

  test('[DC-EXT-01] @extended Given pre-existing consent in TEST_CONSENT_ID, when retrieved, then returns 200 with consent data', async ({ request }) => {
    const consentId = preExistingConsentIdOrSkip();
    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(getDataString(body, 'ConsentId')).toBe(consentId);
  });
});
