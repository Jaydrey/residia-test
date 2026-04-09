import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly pageRoot: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.signInButton = page.getByTestId('login-submit-button');
    // The login form renders errors as a plain div (no ARIA role="alert").
    // Use a text-based locator scoped to the login page root for resilience.
    this.errorMessage = page.getByTestId('login-page').locator('div').filter({ hasText: /invalid|incorrect|error/i }).first();
    this.pageRoot = page.getByTestId('login-page');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.pageRoot.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
