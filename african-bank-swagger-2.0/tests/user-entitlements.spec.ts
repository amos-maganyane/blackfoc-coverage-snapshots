import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeEntitlementPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// GET /users/{userId}/entitlements
// ===========================
test.describe('GET /users/{userId}/entitlements', () => {

  test('[UE-01] @smoke Given non-existent user ID, when listing entitlements, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/users/nonexistent-user-99999/entitlements`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[UE-02] @smoke Given user entitlements endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/users/some-user-id/entitlements`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[UE-03] @smoke Given user entitlements endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/users/some-user-id/entitlements`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[UE-04] @extended Given read-only scoped credentials, when listing user entitlements, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/users/some-user-id/entitlements`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});

// ===========================
// POST /users/{userId}/entitlements
// ===========================
test.describe('POST /users/{userId}/entitlements', () => {

  test('[UE-05] @smoke Given valid entitlement payload, when submitted to non-existent user, then returns 404 not found', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/users/nonexistent-user-99999/entitlements`,
      {
        headers: authHeaders(),
        data: makeEntitlementPayload(),
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[UE-06] @smoke Given add entitlement endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/users/some-user-id/entitlements`,
      {
        headers: headersWithoutAuth(),
        data: makeEntitlementPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[UE-07] @smoke Given add entitlement endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/users/some-user-id/entitlements`,
      {
        headers: headersWithInvalidToken(),
        data: makeEntitlementPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[UE-08] @extended Given read-only scoped credentials, when adding user entitlement, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(
      `${API_BASE}/users/some-user-id/entitlements`,
      {
        headers: headersWithReadOnlyToken(),
        data: makeEntitlementPayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});

// ===========================
// DELETE /users/{userId}/entitlements/{entitlementId}
// ===========================
test.describe('DELETE /users/{userId}/entitlements/{entitlementId}', () => {

  test('[UE-13] @extended Given a pre-existing user and entitlement, when deleted with authorized credentials, then returns 200', async ({ request }) => {
    const userId = process.env.TEST_USER_ID;
    const entitlementId = process.env.TEST_ENTITLEMENT_ID;
    test.skip(!userId || !entitlementId, 'Skipped: set TEST_USER_ID and TEST_ENTITLEMENT_ID to real IDs to execute');

    const response = await request.delete(
      `${API_BASE}/users/${userId}/entitlements/${entitlementId}`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(200);
  });

  test('[UE-09] @smoke Given valid delete request, when submitted with authorized credentials, then returns 204', async ({ request }) => {
    const start = Date.now();
    const response = await request.delete(
      `${API_BASE}/users/some-user-id/entitlements/some-entitlement-id`,
      { headers: authHeaders() },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(204);
    expect(duration).toBeLessThan(5000);
  });

  test('[UE-10] @smoke Given delete entitlement endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.delete(
      `${API_BASE}/users/some-user-id/entitlements/some-entitlement-id`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[UE-11] @smoke Given delete entitlement endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.delete(
      `${API_BASE}/users/some-user-id/entitlements/some-entitlement-id`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[UE-12] @extended Given read-only scoped credentials, when deleting user entitlement, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.delete(
      `${API_BASE}/users/some-user-id/entitlements/some-entitlement-id`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
