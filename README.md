# Residia Take-Home: E2E Test Suite

Playwright-based end-to-end test suite for a workflow application. Covers login, full request lifecycle across three roles, and boundary/failure cases.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
git clone <repo-url>
cd residia-take-home
npm install
npx playwright install chromium
```

Create a `.env` file in the project root:

```
BASE_URL=https://your-app-url.onrender.com
```

## Running Tests

```bash
npm run test          # headless, all specs
npm run test:headed   # browser visible
npm run test:debug    # step through with Playwright inspector
```

Note: the first run after inactivity may take 30-60 seconds while the Render instance wakes up. That delay is expected and not a test failure.

## Project Structure

```
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env
├── src/
│   └── pages/
│       ├── login.page.ts
│       ├── dashboard.page.ts
│       ├── new-request.page.ts
│       └── request-detail.page.ts
├── tests/
│   ├── test-data.ts
│   ├── smoke.spec.ts
│   ├── core-workflow.spec.ts
│   └── edge-cases.spec.ts
```

## What the Tests Validate

**smoke.spec.ts** — login succeeds and the dashboard loads. Baseline check that the app is reachable and auth works.

**core-workflow.spec.ts** — full request lifecycle: submit a request as a requester, claim and analyze as an operator, approve as a reviewer. Verifies each status transition from draft through approved.

**edge-cases.spec.ts** — invalid login shows an error and stays on the login page. Role boundary check confirms an operator cannot access the reviewer approval action.
