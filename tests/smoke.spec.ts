import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page.js';
import { DashboardPage } from '../src/pages/dashboard.page.js';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'password123';

test.describe('Smoke: Login and Dashboard', () => {
  test('Alice can log in and see the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate to login page and sign in as Alice
    await loginPage.goto();
    await loginPage.login(ALICE_EMAIL, ALICE_PASSWORD);

    // Wait for dashboard to load
    await dashboardPage.waitForLoad();

    // Assert URL
    await expect(page).toHaveURL(/dashboard/);

    // Assert dashboard heading is visible
    await expect(dashboardPage.heading).toBeVisible();

    // Assert key dashboard elements are present
    await expect(dashboardPage.searchInput).toBeVisible();
    await expect(dashboardPage.newRequestButton).toBeVisible();
    await expect(dashboardPage.logoutButton).toBeVisible();
  });
});
