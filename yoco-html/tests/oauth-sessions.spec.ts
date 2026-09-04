import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const AUTH_TOKEN = process.env.API_TOKEN!;

test.describe('OAuth2 Sessions API', () => {
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
    '[YC-25] @smoke Given valid authorized credentials, when get /oauth2/sessions/logout, then returns 200 success',
    { tag: ['@smoke'] },
    async () => {
      const start = Date.now();
      const response = await apiContext.get(`${API_BASE}/oauth2/sessions/logout`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
      expect(response.headers()['content-type']).toContain('application/json');
      const body = await response.json();
      validateSchema(body, 'get--oauth2-sessions-logout-200.schema.json');
    },
  );
  test(
    '[YC-26] @smoke Given no Authorization header is supplied, when get /oauth2/sessions/logout, then returns 401 unauthorized',
    { tag: ['@smoke'] },
    async () => {
      const noAuthContext = await request.newContext();
      const start = Date.now();
      const response = await noAuthContext.get(`${API_BASE}/oauth2/sessions/logout`);
      const duration = Date.now() - start;
      expect(response.status()).toBe(401);
      expect(duration).toBeLessThan(5000);
      await noAuthContext.dispose();
    },
  );
});
