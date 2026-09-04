import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const EXISTING_LOCATION_ID = process.env.EXISTING_LOCATION_ID;
const EXISTING_MODIFIER_GROUP_ID = process.env.EXISTING_MODIFIER_GROUP_ID;

// ==== GET /v1/locations ====

test.describe('GET /v1/locations', () => {
  test(
    '[LOC-01] @smoke Given authorized credentials, when listing locations, then returns 200 with locations list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/locations`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'locations-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[LOC-02] @smoke Given no authorization, when listing locations, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/locations`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[LOC-03] @smoke Given invalid token, when listing locations, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/locations`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[LOC-04] @smoke Given invalid query parameter, when listing locations, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/locations?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[LOC-05] @extended Given read-only scoped token, when listing locations, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/locations`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[LOC-06] @extended Given throttled environment, when listing locations, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/locations`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/locations/:location_id ====

test.describe('GET /v1/locations/:location_id', () => {
  test(
    '[LOCF-01] @extended Given existing location, when fetched by ID, then returns 200 with location details',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_LOCATION_ID, 'Set EXISTING_LOCATION_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/locations/${EXISTING_LOCATION_ID}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'location-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_LOCATION_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[LOCF-02] @smoke Given non-existent location ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/locations/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[LOCF-03] @smoke Given location ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/locations/some-location-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[LOCF-04] @smoke Given location ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/locations/some-location-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[LOCF-05] @extended Given read-only scoped token, when fetching location by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/locations/some-location-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[LOCF-06] @extended Given throttled environment, when fetching location by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/locations/some-location-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/modifier_groups ====

test.describe('GET /v1/modifier_groups', () => {
  test(
    '[MG-01] @smoke Given authorized credentials, when listing modifier groups, then returns 200 with groups list',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/modifier_groups`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'modifier-groups-list-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[MG-02] @smoke Given no authorization, when listing modifier groups, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/modifier_groups`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[MG-03] @smoke Given invalid token, when listing modifier groups, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/modifier_groups`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[MG-04] @smoke Given invalid query parameter, when listing modifier groups, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/modifier_groups?limit=not-a-number`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[MG-05] @extended Given read-only scoped token, when listing modifier groups, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/modifier_groups`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[MG-06] @extended Given throttled environment, when listing modifier groups, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/modifier_groups`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/modifier_groups/:modifier_group_id ====

test.describe('GET /v1/modifier_groups/:modifier_group_id', () => {
  test(
    '[MGF-01] @extended Given existing modifier group, when fetched by ID, then returns 200 with modifier group details',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(!EXISTING_MODIFIER_GROUP_ID, 'Set EXISTING_MODIFIER_GROUP_ID in .env to enable');
      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/modifier_groups/${EXISTING_MODIFIER_GROUP_ID}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'modifier-group-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(EXISTING_MODIFIER_GROUP_ID);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[MGF-02] @smoke Given non-existent modifier group ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/modifier_groups/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[MGF-03] @smoke Given modifier group ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/modifier_groups/some-group-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[MGF-04] @smoke Given modifier group ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/modifier_groups/some-group-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[MGF-05] @extended Given read-only scoped token, when fetching modifier group by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/modifier_groups/some-group-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[MGF-06] @extended Given throttled environment, when fetching modifier group by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/modifier_groups/some-group-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
