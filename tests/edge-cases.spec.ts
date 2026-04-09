import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { NewRequestPage } from '../src/pages/new-request.page';
import { RequestDetailPage } from '../src/pages/request-detail.page';

test.describe('Edge Cases', () => {
  test('invalid login shows error and stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('alice@example.com', 'wrongpassword');

    // Error alert should be visible
    await expect(loginPage.errorMessage).toBeVisible();

    // URL should still contain /login
    expect(page.url()).toContain('/login');

    // Dashboard page root should NOT be present
    const dashboard = new DashboardPage(page);
    await expect(dashboard.pageRoot).toBeHidden();
  });

  test('requester cannot approve or claim their own request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const newRequest = new NewRequestPage(page);
    const requestDetail = new RequestDetailPage(page);

    // Alice (requester) logs in and creates a new request
    await loginPage.goto();
    await loginPage.login('alice@example.com', 'password123');
    await dashboard.waitForLoad();

    await dashboard.clickNewRequest();
    const uniqueTitle = `Role Boundary Test ${Date.now()}`;
    await newRequest.submitRequest(uniqueTitle, 'Testing role boundary: requester should not approve or claim');

    // After submission, redirects to request detail page
    await requestDetail.waitForLoad();

    // Wait for AI analysis to complete — same timeout as core workflow
    await requestDetail.waitForStatus('ready_for_review', 90_000);

    // Alice is the requester — approve and claim buttons must NOT appear
    await expect(requestDetail.approveButton).toBeHidden();
    await expect(requestDetail.claimButton).toBeHidden();
  });
});
