import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { NewRequestPage } from '../src/pages/new-request.page';
import { RequestDetailPage } from '../src/pages/request-detail.page';
import { users, uniqueTitle } from './test-data';

test.describe('Edge Cases', () => {
  test('invalid login shows error and stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.alice.email, 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    expect(page.url()).toContain('/login');

    const dashboard = new DashboardPage(page);
    await expect(dashboard.pageRoot).toBeHidden();
  });

  test('requester cannot approve or claim their own request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const newRequest = new NewRequestPage(page);
    const requestDetail = new RequestDetailPage(page);

    await loginPage.goto();
    await loginPage.login(users.alice.email, users.alice.password);
    await dashboard.waitForLoad();

    await dashboard.clickNewRequest();
    const title = uniqueTitle('Broken window latch in lobby');
    await newRequest.submitRequest(title, 'The window latch on the ground floor lobby window is broken and the window cannot be secured properly.');

    await requestDetail.waitForLoad();

    // Wait for AI analysis so buttons would appear for authorized roles
    await requestDetail.waitForStatus('ready_for_review', 90_000);

    // Alice is the requester — these buttons must not be visible to her
    await expect(requestDetail.approveButton).toBeHidden();
    await expect(requestDetail.claimButton).toBeHidden();
  });
});
