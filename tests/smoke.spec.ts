import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { users } from './test-data';

test.describe('Smoke: Login and Dashboard', () => {
  test('Alice can log in and see the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(users.alice.email, users.alice.password);
    await dashboardPage.waitForLoad();

    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.searchInput).toBeVisible();
    await expect(dashboardPage.newRequestButton).toBeVisible();
    await expect(dashboardPage.logoutButton).toBeVisible();
  });
});
