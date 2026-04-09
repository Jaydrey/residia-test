import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { NewRequestPage } from '../src/pages/new-request.page';
import { RequestDetailPage } from '../src/pages/request-detail.page';
import { users, uniqueTitle } from './test-data';

test.describe('Core Workflow', () => {
  test('full request lifecycle: submit -> AI analysis -> approve -> claim', async ({ page }) => {
    const title = uniqueTitle('Lobby light fixture replacement');
    const description = 'The main ceiling light in the lobby entrance has been flickering intermittently for the past week and needs to be replaced before it fails completely.';

    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const newRequest = new NewRequestPage(page);
    const requestDetail = new RequestDetailPage(page);

    // Alice submits a new request
    await loginPage.goto();
    await loginPage.login(users.alice.email, users.alice.password);
    await dashboard.waitForLoad();

    await dashboard.clickNewRequest();
    await newRequest.submitRequest(title, description);
    await requestDetail.waitForLoad();

    // Wait for AI analysis to complete (20-45s, 90s ceiling for Render cold starts)
    await requestDetail.waitForStatus('ready_for_review', 90_000);
    await expect(requestDetail.aiResult).toBeVisible();

    // Bob approves the request
    await page.goto('/dashboard');
    await dashboard.waitForLoad();
    await dashboard.logout();

    await loginPage.login(users.bob.email, users.bob.password);
    await dashboard.waitForLoad();

    await dashboard.searchByTitle(title);
    await dashboard.waitForRequestVisible(title);
    await dashboard.viewFirstRequest();

    await requestDetail.waitForLoad();
    await requestDetail.waitForStatus('ready_for_review');
    await requestDetail.approve();

    // Charlie claims the approved request
    await page.goto('/dashboard');
    await dashboard.waitForLoad();
    await dashboard.logout();

    await loginPage.login(users.charlie.email, users.charlie.password);
    await dashboard.waitForLoad();

    await dashboard.searchByTitle(title);
    await dashboard.waitForRequestVisible(title);
    await dashboard.viewFirstRequest();

    await requestDetail.waitForLoad();
    await requestDetail.waitForStatus('approved');
    await requestDetail.claim();

    const finalStatus = await requestDetail.getStatus();
    expect(finalStatus.toLowerCase()).toContain('claimed');
  });
});
