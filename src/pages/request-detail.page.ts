import { type Page, type Locator, expect } from '@playwright/test';

export class RequestDetailPage {
  readonly page: Page;

  // Page root
  readonly pageRoot: Locator;

  // Request info
  readonly requestTitle: Locator;
  readonly requestStatus: Locator;
  readonly requestDescription: Locator;

  // AI analysis — present during analysis phase
  readonly aiAnalyzingIndicator: Locator;
  // AI result section — present once analysis completes
  readonly aiResult: Locator;

  // Actions area
  readonly actionsSection: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly approveButton: Locator;
  readonly claimButton: Locator;

  // Activity timeline
  readonly timeline: Locator;

  // Confirmation modal elements
  readonly confirmModal: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageRoot = page.getByTestId('request-detail-page');
    this.requestTitle = page.getByTestId('request-title');
    this.requestStatus = page.getByTestId('request-status');
    this.requestDescription = page.getByTestId('request-description');
    this.aiAnalyzingIndicator = page.getByTestId('ai-analyzing-indicator');
    this.aiResult = page.getByTestId('ai-result');
    this.actionsSection = page.getByTestId('actions');
    this.editButton = page.getByTestId('edit-button');
    this.deleteButton = page.getByTestId('delete-button');
    this.approveButton = page.getByTestId('approve-button');
    this.claimButton = page.getByTestId('claim-button');
    this.timeline = page.getByTestId('timeline');
    this.confirmModal = page.getByTestId('confirm-modal').first();
    this.confirmButton = page.getByTestId('confirm-button').first();
    this.cancelButton = page.getByTestId('cancel-button').first();
  }

  async waitForLoad(): Promise<void> {
    await this.pageRoot.waitFor({ state: 'visible' });
  }

  async getStatus(): Promise<string> {
    return (await this.requestStatus.textContent() ?? '').trim();
  }

  /**
   * Waits until the status badge contains the expected status text.
   * Uses Playwright's built-in auto-retry — no manual polling.
   * Default timeout of 90s covers the 20-45s AI analysis window.
   */
  async waitForStatus(status: string, timeout = 90_000): Promise<void> {
    await expect(this.requestStatus).toContainText(status, { timeout });
  }

  async approve(): Promise<void> {
    await this.approveButton.click();
    await this.confirmButton.click();
    await this.waitForStatus('approved');
  }

  async claim(): Promise<void> {
    await this.claimButton.click();
    await this.confirmButton.click();
    await this.waitForStatus('claimed');
  }
}
