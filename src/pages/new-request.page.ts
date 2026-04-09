import { type Page, type Locator } from '@playwright/test';

export class NewRequestPage {
  readonly page: Page;

  // Locators
  readonly pageRoot: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitButton: Locator;
  readonly titleError: Locator;
  readonly descriptionError: Locator;
  readonly titleCharCount: Locator;
  readonly descriptionCharCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageRoot = page.getByTestId('new-request-page');
    this.titleInput = page.getByTestId('request-title-input');
    this.descriptionInput = page.getByTestId('request-description-input');
    this.submitButton = page.getByTestId('submit-request-button');
    this.titleError = page.getByTestId('title-error');
    this.descriptionError = page.getByTestId('description-error');
    this.titleCharCount = page.getByTestId('title-char-count');
    this.descriptionCharCount = page.getByTestId('description-char-count');
  }

  async goto(): Promise<void> {
    await this.page.goto('/requests/new');
    await this.pageRoot.waitFor({ state: 'visible' });
  }

  async submitRequest(title: string, description: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.page.goBack();
  }
}
