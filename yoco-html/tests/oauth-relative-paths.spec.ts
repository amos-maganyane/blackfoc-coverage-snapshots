import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeOAuthTokenPayload } from './helpers/test-data';

/**
 * These tests cover the relative-path endpoint variants found in the API spec.
 * They use process.env.API_BASE and process.env.IAM_API_BASE as the host.
 * Endpoints: /oauth2/sessions/logout, /userinfo, /oauth2/token
 */

const IAM_BASE = process.env.IAM_API_BASE!;

// ==== GET /oauth2/sessions/logout (relative) ====

test.describe('GET /oauth2/sessions/logout (relative path variant)', () => {
  test(
    '[RLOGT-01] @smoke Given session token, when logout requested via relative path, then returns 200',
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

  test(
    '[RLOGT-02] @smoke Given no authorization, when logout requested, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${IAM_BASE}/oauth2/sessions/logout`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== GET /userinfo (relative) ====

test.describe('GET /userinfo (relative path variant)', () => {
  test(
    '[RUINF-01] @smoke Given valid bearer token, when userinfo requested via relative path, then returns 200 with user details',
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
    '[RUINF-02] @smoke Given no authorization, when userinfo requested via relative path, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${IAM_BASE}/userinfo`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );
});

// ==== POST /oauth2/token (relative) ====

test.describe('POST /oauth2/token (relative path variant)', () => {
  test(
    '[RTOK-01] @smoke Given valid client credentials, when token requested via relative path, then returns 200 with access_token',
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
    '[RTOK-02] @smoke Given invalid client credentials, when token requested via relative path, then returns 401 unauthorized',
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
});
