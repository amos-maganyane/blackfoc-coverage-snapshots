import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

test.describe('POST /api/attachments — Upload a file', () => {

  test('[AT-01] @smoke Given a valid file upload with authorization, when the file is uploaded, then returns 200 with attachment details', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/api/attachments`, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      multipart: {
        file: {
          name: 'test-file.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test file content'),
        },
      },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'attachment-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[AT-02] @smoke Given attachment upload, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/attachments`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[AT-03] @smoke Given attachment upload, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/attachments`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

});
