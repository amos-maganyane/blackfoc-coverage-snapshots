# Grindrod Bank API Test Suite

Playwright API tests for the Grindrod Bank API v4.1.0.

## Prerequisites

- Node.js 18+
- `npm install`
- Copy `.env.example` to `.env` and fill in values

## Running Tests

```bash
npm run test:smoke                    # Smoke tests only — zero-setup green run (CI default)
npm test                              # All tests (smoke + extended)
npm run test:extended                 # Extended tests only (needs extra env vars)
npx playwright test --grep AC         # Filter accounts tests
npx playwright test --grep CU         # Filter customers tests
```

## Environment Variables

### REQUIRED

| Variable   | Description                                         |
|------------|-----------------------------------------------------|
| `API_BASE` | Base URL of the API (e.g. `https://api.grindrodbank.co.za/api`) |
| `API_TOKEN`| Bearer token for authentication                     |

### OPTIONAL

| Variable             | Description                                        | Default          |
|----------------------|----------------------------------------------------|------------------|
| `AGENT_ID`           | Value for the required `Agent-Id` header           | `test-agent-id`  |
| `API_TOKEN_READ_ONLY`| Scoped read-only token for 403 forbidden tests     | —                |

### ADVANCED

| Variable | Description                                               |
|----------|-----------------------------------------------------------|
| `CI`     | Set to `true` in CI environments — enables retries        |

## Test Coverage

| Domain               | Spec File                              | Endpoints |
|----------------------|----------------------------------------|-----------|
| Accounts (list/create) | `tests/accounts-list.spec.ts`        | GET/POST /accounts |
| Accounts (public)    | `tests/accounts-public.spec.ts`        | GET /accounts/public |
| Account by ID        | `tests/account-by-id.spec.ts`          | GET /accounts/{id} |
| Transaction Request Types | `tests/txn-request-types.spec.ts` | GET /accounts/{id}/transaction-request-types |
| Transaction Requests | `tests/txn-requests.spec.ts`           | GET /accounts/{id}/transaction-requests |
| Beneficiary Txn      | `tests/txn-beneficiary.spec.ts`        | POST …/BENEFICIARY |
| Free Form Txn        | `tests/txn-freeform.spec.ts`           | POST …/FREE_FORM |
| Public Account Txn   | `tests/txn-public-account.spec.ts`     | POST …/PUBLIC_ACCOUNT |
| Transfer Txn         | `tests/txn-transfer.spec.ts`           | POST …/TRANSFER_TO_ACCOUNT |
| Transactions         | `tests/transactions.spec.ts`           | GET /accounts/{id}/transactions |
| Transaction by ID    | `tests/transaction-by-id.spec.ts`      | GET /accounts/{id}/transactions/{txId} |
| Banks                | `tests/banks.spec.ts`                  | GET /banks |
| Customers            | `tests/customers-list.spec.ts`         | GET/POST /customers |
| Customer by ID       | `tests/customer-by-id.spec.ts`         | GET /customers/{id} |
| Beneficiaries        | `tests/beneficiaries.spec.ts`          | GET/POST /customers/{id}/beneficiaries |
| Beneficiary by ID    | `tests/beneficiary-by-id.spec.ts`      | GET /customers/{id}/beneficiaries/{bId} |
| Customer Messages    | `tests/customer-messages.spec.ts`      | GET/POST /customers/{id}/messages |
| Entitlements         | `tests/entitlements.spec.ts`           | GET /entitlements |
| FICA (create/get)    | `tests/fica-individuals.spec.ts`       | POST/GET /fica/individuals |
| FICA (update)        | `tests/fica-update.spec.ts`            | PUT/PATCH /fica/individuals/{id} |
| Guarantees           | `tests/guarantees.spec.ts`             | GET /guarantees/{id}/state |
| Investment Types     | `tests/investment-types.spec.ts`       | GET /investment-types |
| Products             | `tests/products.spec.ts`               | GET/GET /products |
| Users                | `tests/users.spec.ts`                  | POST /users, GET /users/current/* |
| User by ID           | `tests/user-by-id.spec.ts`             | GET /users/{id} |
| User Entitlements    | `tests/user-entitlements.spec.ts`      | GET/POST/DELETE /users/{id}/entitlements |
| Validate Account     | `tests/validate-account.spec.ts`       | POST /validate/accountnumber |
| Verify Account       | `tests/verify-account.spec.ts`         | POST /verifications/account |
| Workflows            | `tests/workflows.spec.ts`              | Multi-step chains |

## Test Data

Mutating tests (POST, PUT, PATCH, DELETE) create resources using unique IDs per run.
No cleanup is performed — test data accumulates in the target environment.

- **Smoke tests** cover happy-path creation, auth failure, and validation scenarios. They require only API_BASE and API_TOKEN.
- **Extended tests** may create resources (customers, users, FICA records, etc.)
- Run extended tests only in sandbox/test environments
- If data pollution is a concern, use a dedicated test tenant

## Reports

### HTML (built-in)

```bash
npx playwright show-report
```

### Allure

```bash
npm run allure:generate   # Generate report from allure-results/
npm run allure:open       # Open generated report in browser
npm run allure:serve      # One-shot: generate + serve (no prior generate needed)
```

Allure results are written to `allure-results/` on every test run. The `allure-history.jsonl` file tracks historical trends across runs when present.
