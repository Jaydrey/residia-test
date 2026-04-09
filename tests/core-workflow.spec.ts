import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { NewRequestPage } from '../src/pages/new-request.page';
import { RequestDetailPage } from '../src/pages/request-detail.page';

test.describe('Core Workflow', () => {
  test('full request lifecycle: submit -> AI analysis -> approve -> claim', async ({ page }) => {
    const uniqueTitle = `Test Request ${Date.now()}`;
    const description = 'Automated E2E test for the complete request lifecycle';

    // --- STEP 1: Alice submits a new request ---
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const newRequest = new NewRequestPage(page);
    const requestDetail = new RequestDetailPage(page);

    await loginPage.goto();
    await loginPage.login('alice@example.com', 'password123');
    await dashboard.waitForLoad();

    await dashboard.clickNewRequest();
    await newRequest.submitRequest(uniqueTitle, description);

    // After submission, app redirects to request detail page
    await requestDetail.waitForLoad();

    // The app transitions submitted -> ai_analyzing almost immediately.
    // Verify the request detail page is showing (status may already be ai_analyzing).

    // --- STEP 2: Wait for AI analysis to complete ---
    // Uses Playwright auto-retry via expect().toContainText() -- NO polling loops, NO sleeps
    // 90s timeout covers the 20-45s AI analysis window plus Render cold start margin
    await requestDetail.waitForStatus('ready_for_review', 90_000);

    // Verify AI result section appears after analysis
    await expect(requestDetail.aiResult).toBeVisible();

    // --- STEP 3: Alice logs out, Bob logs in to approve ---
    await page.goto('/dashboard');
    await dashboard.waitForLoad();
    await dashboard.logout();

    await loginPage.login('bob@example.com', 'password123');
    await dashboard.waitForLoad();

    // Bob finds the request by searching its unique title
    await dashboard.searchByTitle(uniqueTitle);
    await dashboard.waitForRequestVisible(uniqueTitle);
    await dashboard.viewFirstRequest();

    await requestDetail.waitForLoad();
    await requestDetail.waitForStatus('ready_for_review');
    await requestDetail.approve();

    // --- STEP 4: Bob logs out, Charlie logs in to claim ---
    await page.goto('/dashboard');
    await dashboard.waitForLoad();
    await dashboard.logout();

    await loginPage.login('charlie@example.com', 'password123');
    await dashboard.waitForLoad();

    // Charlie finds the request by searching its unique title
    await dashboard.searchByTitle(uniqueTitle);
    await dashboard.waitForRequestVisible(uniqueTitle);
    await dashboard.viewFirstRequest();

    await requestDetail.waitForLoad();
    await requestDetail.waitForStatus('approved');
    await requestDetail.claim();

    // --- FINAL VERIFICATION ---
    const finalStatus = await requestDetail.getStatus();
    expect(finalStatus.toLowerCase()).toContain('claimed');
  });
});
