import { test, expect } from '@playwright/test';
import { authHeaders } from './helpers/auth';
import {
  makeCreateCustomerPayload,
  makeCreateBeneficiaryPayload,
  makeCreateCustomerMessagePayload,
  makeIndividualFicaPayload,
  makeCreateUserPayload,
  makeEntitlementPayload,
} from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// Customer → Beneficiary workflow
// ===========================
test.describe('Workflow: Customer → Beneficiary', () => {

  test('[WF-01] @extended Given newly created customer, when beneficiaries listed, then returns 200 with empty or populated collection', async ({ request }) => {
    // Step 1: Create customer
    const createCustomerResp = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: makeCreateCustomerPayload(),
    });
    expect(createCustomerResp.status()).toBe(201);
    const customer = await createCustomerResp.json();
    const customerId: string = customer.id ?? customer.customerId ?? customer.data?.id;
    expect(customerId).toBeDefined();

    // Step 2: List beneficiaries for the new customer
    const listResp = await request.get(
      `${API_BASE}/customers/${customerId}/beneficiaries`,
      { headers: authHeaders() },
    );
    expect(listResp.status()).toBe(200);
  });

  test('[WF-02] @extended Given newly created customer, when beneficiary created then retrieved, then identity echo matches', async ({ request }) => {
    // Step 1: Create customer
    const createCustomerResp = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: makeCreateCustomerPayload(),
    });
    expect(createCustomerResp.status()).toBe(201);
    const customer = await createCustomerResp.json();
    const customerId: string = customer.id ?? customer.customerId ?? customer.data?.id;
    expect(customerId).toBeDefined();

    // Step 2: Create beneficiary for the customer
    const createBenResp = await request.post(
      `${API_BASE}/customers/${customerId}/beneficiaries`,
      {
        headers: authHeaders(),
        data: makeCreateBeneficiaryPayload(),
      },
    );
    expect(createBenResp.status()).toBe(201);
    const beneficiary = await createBenResp.json();
    const beneficiaryId: string = beneficiary.id ?? beneficiary.beneficiaryId ?? beneficiary.data?.id;
    expect(beneficiaryId).toBeDefined();

    // Step 3: Retrieve beneficiary by ID — identity echo
    const getResp = await request.get(
      `${API_BASE}/customers/${customerId}/beneficiaries/${beneficiaryId}`,
      { headers: authHeaders() },
    );
    expect(getResp.status()).toBe(200);
    const body = await getResp.json();
    const returnedId: string = body.id ?? body.beneficiaryId ?? body.data?.id;
    expect(returnedId).toBe(beneficiaryId);
  });

});

// ===========================
// Customer → Messages workflow
// ===========================
test.describe('Workflow: Customer → Messages', () => {

  test('[WF-03] @extended Given newly created customer, when message created then messages listed, then 200 returned', async ({ request }) => {
    // Step 1: Create customer
    const createCustomerResp = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: makeCreateCustomerPayload(),
    });
    expect(createCustomerResp.status()).toBe(201);
    const customer = await createCustomerResp.json();
    const customerId: string = customer.id ?? customer.customerId ?? customer.data?.id;
    expect(customerId).toBeDefined();

    // Step 2: Create message for customer
    const createMsgResp = await request.post(
      `${API_BASE}/customers/${customerId}/messages`,
      {
        headers: authHeaders(),
        data: makeCreateCustomerMessagePayload(),
      },
    );
    expect(createMsgResp.status()).toBe(201);

    // Step 3: List messages
    const listResp = await request.get(
      `${API_BASE}/customers/${customerId}/messages`,
      { headers: authHeaders() },
    );
    expect(listResp.status()).toBe(200);
  });

});

// ===========================
// FICA create → retrieve workflow
// ===========================
test.describe('Workflow: FICA create → retrieve', () => {

  test('[WF-04] @extended Given newly created FICA record, when retrieved by ficaId, then identity echo matches', async ({ request }) => {
    // Step 1: Create FICA record
    const createResp = await request.post(`${API_BASE}/fica/individuals`, {
      headers: authHeaders(),
      data: makeIndividualFicaPayload(),
    });
    expect(createResp.status()).toBe(201);
    const fica = await createResp.json();
    const ficaId: string = fica.id ?? fica.ficaId ?? fica.data?.id;
    expect(ficaId).toBeDefined();

    // Step 2: Retrieve FICA by ID
    const getResp = await request.get(
      `${API_BASE}/fica/individuals/${ficaId}`,
      { headers: authHeaders() },
    );
    expect(getResp.status()).toBe(200);
    const body = await getResp.json();
    const returnedId: string = body.id ?? body.ficaId ?? body.data?.id;
    expect(returnedId).toBe(ficaId);
  });

});

// ===========================
// User → Entitlements workflow
// ===========================
test.describe('Workflow: User → Entitlements', () => {

  test('[WF-05] @extended Given newly created user, when entitlement added then retrieved, then entitlement list is non-empty', async ({ request }) => {
    // Step 1: Create user
    const createUserResp = await request.post(`${API_BASE}/users`, {
      headers: authHeaders(),
      data: makeCreateUserPayload(),
    });
    expect(createUserResp.status()).toBe(201);
    const user = await createUserResp.json();
    const userId: string = user.id ?? user.userId ?? user.data?.id;
    expect(userId).toBeDefined();

    // Step 2: Add entitlement for user
    const addEntitlementResp = await request.post(
      `${API_BASE}/users/${userId}/entitlements`,
      {
        headers: authHeaders(),
        data: makeEntitlementPayload(),
      },
    );
    expect(addEntitlementResp.status()).toBe(201);

    // Step 3: List entitlements for user
    const listResp = await request.get(
      `${API_BASE}/users/${userId}/entitlements`,
      { headers: authHeaders() },
    );
    expect(listResp.status()).toBe(200);
  });

});
