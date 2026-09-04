import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

// ============================
// GET /v1/oauth2/token_info
// ============================
test.describe('GET /v1/oauth2/token_info', () => {

  test('[OA-01] @smoke Given authorized credentials, when fetching token info, then returns 200 with token details', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/oauth2/token_info`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(body).toBeDefined();
    expect(duration).toBeLessThan(5000);
  });
});
