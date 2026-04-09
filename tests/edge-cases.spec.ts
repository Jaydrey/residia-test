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
});
