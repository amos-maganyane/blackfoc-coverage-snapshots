import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeOAuthTokenPayload } from './helpers/test-data';

const IAM_BASE = process.env.IAM_API_BASE!;
const API_BASE = process.env.API_BASE!;

// ==== GET /oauth2/auth (OAuth authorize) ====

test.describe('GET /oauth2/auth', () => {
  test(
    '[OA-01] @smoke Given valid OAuth authorize request, when authorization flow initiated, then returns 200',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${IAM_BASE}/oauth2/auth`, {
        headers: { 'Accept': 'text/html,application/json' },
        params: {
          response_type: 'code',
          client_id: process.env.OAUTH_CLIENT_ID ?? 'test-client-id',
          redirect_uri: 'https://example.com/callback',
          scope: 'openid',
        },
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
    },
  );
});

// ==== GET /oauth2/sessions/logout ====

test.describe('GET /oauth2/sessions/logout (IAM)', () => {
  test(
    '[OL-01] @smoke Given session token, when logout requested, then returns 200',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${IAM_BASE}/oauth2/sessions/logout`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
    },
  );
});

// ==== POST /oauth2/token (IAM) ====

test.describe('POST /oauth2/token (IAM)', () => {
  test(
    '[OT-01] @smoke Given valid client credentials, when token requested, then returns 200 with access_token',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${IAM_BASE}/oauth2/token`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        form: makeOAuthTokenPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'oauth-token-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[OT-02] @smoke Given invalid client credentials, when token requested, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${IAM_BASE}/oauth2/token`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        form: {
          grant_type: 'client_credentials',
          client_id: 'invalid-client',
          client_secret: 'invalid-secret',
        },
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[OT-03] @smoke Given missing grant_type, when token requested, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(`${IAM_BASE}/oauth2/token`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        form: {
          client_id: process.env.OAUTH_CLIENT_ID ?? 'test-client-id',
        },
      });
      expect(response.status()).toBe(400);
    },
  );
});

// ==== GET /userinfo (IAM) ====

test.describe('GET /userinfo (IAM)', () => {
  test(
    '[UI-01] @smoke Given valid bearer token, when userinfo requested, then returns 200 with user details',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${IAM_BASE}/userinfo`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'userinfo-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[UI-02] @smoke Given no authorization, when userinfo requested, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${IAM_BASE}/userinfo`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[UI-03] @smoke Given invalid token, when userinfo requested, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${IAM_BASE}/userinfo`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== GET /v1/oauth2/token_info (Yoco API) ====

test.describe('GET /v1/oauth2/token_info', () => {
  test(
    '[TI-01] @smoke Given valid bearer token, when token info requested, then returns 200 with token metadata',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/oauth2/token_info`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'token-info-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[TI-02] @smoke Given no authorization, when token info requested, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/oauth2/token_info`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );
});
