import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateUserPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('GET /users/{userId}', () => {

  test('[UI-00] @extended Given newly created user ID, when retrieved, then returns 200 with user data', async ({ request }) => {
    const createResponse = await request.post(`${API_BASE}/users`, {
      headers: authHeaders(),
      data: makeCreateUserPayload(),
    });
    expect(createResponse.status()).toBe(201);

    const createdUser = await createResponse.json();
    const userId: string = createdUser.id ?? createdUser.userId ?? createdUser.data?.id;
    expect(userId).toBeDefined();

    const response = await request.get(
      `${API_BASE}/users/${userId}`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    validateSchema(body, 'user-response.json');
  });

  test('[UI-01] @smoke Given non-existent user ID, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/users/nonexistent-user-id-99999`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[UI-02] @smoke Given user by ID endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/users/some-user-id`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[UI-03] @smoke Given user by ID endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/users/some-user-id`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[UI-04] @extended Given read-only scoped credentials, when retrieving user by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/users/some-user-id`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
