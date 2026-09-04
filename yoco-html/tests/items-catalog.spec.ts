import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_ITEM_BRAND_ID = process.env.EXISTING_ITEM_BRAND_ID;
const EXISTING_ITEM_CATEGORY_ID = process.env.EXISTING_ITEM_CATEGORY_ID;
const EXISTING_ITEM_ID = process.env.EXISTING_ITEM_ID;

// ==== GET /v1/item_brands ====

test.describe('GET /v1/item_brands', () => {
  test(
    '[IB-01] @smoke Given authorized credentials, when listing item brands, then returns 200 with item brands list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/item_brands`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'item-brands-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[IB-02] @smoke Given no authorization, when listing item brands, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/item_brands`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IB-03] @smoke Given invalid token, when listing item brands, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/item_brands`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IB-04] @smoke Given invalid query parameter, when listing item brands, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/item_brands?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[IB-05] @extended Given read-only scoped token, when listing item brands, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/item_brands`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[IB-06] @extended Given throttled environment, when listing item brands, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/item_brands`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/item_brands/:item_brand_id ====

test.describe('GET /v1/item_brands/:item_brand_id', () => {
  test(
    '[IBF-01] @extended Given existing item brand, when fetched by ID, then returns 200 with brand details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_ITEM_BRAND_ID,
        'Set EXISTING_ITEM_BRAND_ID in .env to enable',
      );
      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/item_brands/${EXISTING_ITEM_BRAND_ID}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'item-brand-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_ITEM_BRAND_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[IBF-02] @smoke Given non-existent item brand ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/item_brands/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[IBF-03] @smoke Given item brand ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/item_brands/some-brand-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IBF-04] @smoke Given item brand ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/item_brands/some-brand-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IBF-05] @extended Given read-only scoped token, when fetching item brand by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/item_brands/some-brand-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[IBF-06] @extended Given throttled environment, when fetching item brand by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/item_brands/some-brand-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/item_categories ====

test.describe('GET /v1/item_categories', () => {
  test(
    '[IC-01] @smoke Given authorized credentials, when listing item categories, then returns 200 with categories list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/item_categories`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'item-categories-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[IC-02] @smoke Given no authorization, when listing item categories, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/item_categories`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IC-03] @smoke Given invalid token, when listing item categories, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/item_categories`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IC-04] @smoke Given invalid query parameter, when listing item categories, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/item_categories?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[IC-05] @extended Given read-only scoped token, when listing item categories, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/item_categories`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[IC-06] @extended Given throttled environment, when listing item categories, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/item_categories`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/item_categories/:item_category_id ====

test.describe('GET /v1/item_categories/:item_category_id', () => {
  test(
    '[ICF-01] @extended Given existing item category, when fetched by ID, then returns 200 with category details',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_ITEM_CATEGORY_ID,
        'Set EXISTING_ITEM_CATEGORY_ID in .env to enable',
      );
      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/item_categories/${EXISTING_ITEM_CATEGORY_ID}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'item-category-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_ITEM_CATEGORY_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[ICF-02] @smoke Given non-existent item category ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/item_categories/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[ICF-03] @smoke Given item category ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/item_categories/some-category-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ICF-04] @smoke Given item category ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/item_categories/some-category-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ICF-05] @extended Given read-only scoped token, when fetching item category by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/item_categories/some-category-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ICF-06] @extended Given throttled environment, when fetching item category by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/item_categories/some-category-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/items ====

test.describe('GET /v1/items', () => {
  test(
    '[IT-01] @smoke Given authorized credentials, when listing items, then returns 200 with items list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/items`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'items-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[IT-02] @smoke Given no authorization, when listing items, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/items`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IT-03] @smoke Given invalid token, when listing items, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/items`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[IT-04] @smoke Given invalid query parameter, when listing items, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/items?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[IT-05] @extended Given read-only scoped token, when listing items, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/items`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[IT-06] @extended Given throttled environment, when listing items, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/items`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/items/:item_id ====

test.describe('GET /v1/items/:item_id', () => {
  test(
    '[ITF-01] @extended Given existing item, when fetched by ID, then returns 200 with item details echoing the ID',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_ITEM_ID, 'Set EXISTING_ITEM_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/items/${EXISTING_ITEM_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'item-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_ITEM_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[ITF-02] @smoke Given non-existent item ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/items/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[ITF-03] @smoke Given item ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/items/some-item-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ITF-04] @smoke Given item ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/items/some-item-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[ITF-05] @extended Given read-only scoped token, when fetching item by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/items/some-item-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[ITF-06] @extended Given throttled environment, when fetching item by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/items/some-item-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
