# Yoco API Test Suite

Playwright API tests for the Yoco API — covering Checkout API, OAuth/IAM, Capital, Card Machines, Items, Locations, Orders, Payment Links, Payments, Payouts, Refunds, Staff, WebPOS, and Webhooks.

## Prerequisites

- Node.js 18+
- `npm install`
- Copy `.env.example` to `.env` and fill in values

## Quick Start

```bash
cp .env.example .env
# Edit .env — set API_BASE and API_TOKEN at minimum
npm install
npx playwright install --with-deps chromium  # Optional, for HTML report
npm run test:smoke
```

## Running Tests

```bash
npm run test:smoke        # Smoke tests only — zero-setup green run (CI default)
npm test                  # All tests (smoke + extended)
npm run test:extended     # Extended tests only (needs extra env vars)
npx playwright test --grep WF    # Workflow tests only
npx playwright test --grep CO    # Checkout API tests only
npx playwright test --grep PAY   # Payments tests only
```

## Reports

### HTML (built-in)

```bash
npm run test:report       # Open HTML report after test run
```

### Allure

```bash
npm run allure:generate   # Generate report from allure-results/
npm run allure:open       # Open generated report in browser
npm run allure:serve      # One-shot: generate + serve
```

## Test Naming Convention

Every test follows `[XX-NN] @tag Given <precondition>, when <action>, then <business outcome>`.

| Prefix | Domain |
|--------|--------|
| CO | Checkout create |
| CR | Checkout refund |
| CWL/CWR/CWD | Checkout webhooks (list/register/delete) |
| OA/OL/OT/UI | OAuth/IAM |
| TI | Token info |
| CAA/CAO | Capital advances/offers |
| CM/CMF | Card machines |
| IB/IC/IT | Items, brands, categories |
| LOC/MG | Locations, modifier groups |
| ORD | Orders |
| PL/PLC/PLF/PLD | Payment links |
| PAY | Payments |
| PYT/PYTE | Payouts |
| REF | Refunds |
| STF | Staff |
| WPD/WPDF/WPP/WPPF | WebPOS |
| WKE/WKS/WKSC/WKSF/WKSU/WKSD/WKSS/WKST | Yoco Webhooks |
| WF | Workflows |
| R* | Relative path variants |

## File Structure

```
tests/
  post-checkout-create.spec.ts        # POST /api/checkouts
  post-checkout-refund.spec.ts        # POST /api/checkouts/:id/refund
  checkout-webhooks.spec.ts           # GET/POST/DELETE /api/webhooks
  oauth-iam.spec.ts                   # OAuth/IAM + token_info
  oauth-relative-paths.spec.ts        # Relative path OAuth variants
  capital.spec.ts                     # Capital advances & offers
  card-machines.spec.ts               # Card machines
  items-catalog.spec.ts               # Items, brands, categories
  locations-modifiers.spec.ts         # Locations & modifier groups
  orders.spec.ts                      # Orders
  payment-links.spec.ts               # Payment links
  payments.spec.ts                    # Payments
  payouts.spec.ts                     # Payouts & payout entries
  refunds.spec.ts                     # Refunds
  staff.spec.ts                       # Staff
  webpos.spec.ts                      # Web POS devices & payments
  yoco-webhooks.spec.ts               # Yoco webhook subscriptions
  relative-path-variants.spec.ts      # Relative path API spec variants
  workflows.spec.ts                   # Multi-step end-to-end chains
  helpers/
    auth.ts                           # Headers & auth helpers
    test-data.ts                      # Payload factories & uniqueId
    schema-validator.ts               # AJV schema validation
  fixtures/schemas/
    checkout-response.json
    refund-response.json
    checkout-webhook-response.json
    checkout-webhook-list-response.json
    oauth-token-response.json
    userinfo-response.json
    capital-advances-response.json
    capital-offers-response.json
    card-machines-list-response.json
    card-machine-response.json
    item-brands-list-response.json
    item-brand-response.json
    item-categories-list-response.json
    item-category-response.json
    items-list-response.json
    item-response.json
    locations-list-response.json
    location-response.json
    modifier-groups-list-response.json
    modifier-group-response.json
    token-info-response.json
    orders-list-response.json
    order-response.json
    payment-link-response.json
    payment-links-list-response.json
    payment-response.json
    payments-list-response.json
    payout-response.json
    payouts-list-response.json
    payout-entries-response.json
    yoco-refund-response.json
    yoco-refunds-list-response.json
    staff-member-response.json
    staff-list-response.json
    webpos-device-response.json
    webpos-payment-response.json
    webhook-subscription-response.json
    webhook-subscriptions-list-response.json
    webhook-events-list-response.json
    webhook-secret-response.json
```

## Environment Variables

### REQUIRED

| Variable | Description |
|----------|-------------|
| `API_BASE` | Yoco API base URL (e.g. `https://api.yoco.com`) |
| `API_TOKEN` | Bearer token for authentication |

### OPTIONAL

| Variable | Description | Default |
|----------|-------------|---------|
| `CHECKOUT_API_BASE` | Checkout API base URL | `https://payments.yoco.com` |
| `IAM_API_BASE` | IAM/OAuth base URL | `https://iam.yoco.com` |
| `OAUTH_CLIENT_ID` | OAuth2 client ID for token tests | — |
| `OAUTH_CLIENT_SECRET` | OAuth2 client secret for token tests | — |
| `EXISTING_CARD_MACHINE_ID` | Known card machine ID | — |
| `EXISTING_ITEM_BRAND_ID` | Known item brand ID | — |
| `EXISTING_ITEM_CATEGORY_ID` | Known item category ID | — |
| `EXISTING_ITEM_ID` | Known item ID | — |
| `EXISTING_LOCATION_ID` | Known location ID | — |
| `EXISTING_MODIFIER_GROUP_ID` | Known modifier group ID | — |
| `EXISTING_ORDER_ID` | Known order ID | — |
| `EXISTING_PAYMENT_ID` | Known payment ID | — |
| `EXISTING_PAYOUT_ID` | Known payout ID | — |
| `EXISTING_REFUND_ID` | Known refund ID | — |
| `EXISTING_STAFF_ID` | Known staff member ID | — |
| `EXISTING_WEBPOS_DEVICE_ID` | Known WebPOS device ID | — |
| `EXISTING_SUBSCRIPTION_ID` | Known webhook subscription ID | — |

### ADVANCED

| Variable | Description |
|----------|-------------|
| `CI` | Set to `true` in CI — enables retries and stricter worker limits |
