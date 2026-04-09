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

  // Confirmation dialog buttons
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
   * Waits until the status badge has the expected data-status attribute value.
   * Uses Playwright's built-in auto-retry — no manual polling.
   * Default timeout of 90s covers the 20-45s AI analysis window.
   * Uses data-status attribute (e.g. 'ready_for_review') rather than rendered text
   * ('ready for review') to avoid underscore/space mismatches.
   */
  async waitForStatus(status: string, timeout = 90_000): Promise<void> {
    await expect(this.requestStatus).toHaveAttribute('data-status', status, { timeout });
  }

  /**
   * Clicks the confirmation button inside the modal.
   * The modal uses CSS visibility that Playwright's built-in checks don't handle correctly
   * (button is in DOM but reported as hidden). We poll via waitForFunction until a
   * confirm button has a non-zero bounding rect (i.e., the modal is visually open),
   * then click it via evaluate() to bypass Playwright's visibility gate.
   */
  private async clickConfirmButton(): Promise<void> {
    // Wait until a confirm button has a non-zero bounding rect (modal is visually open)
    await this.page.waitForFunction(() => {
      const btns = document.querySelectorAll<HTMLElement>('[data-testid="confirm-button"]');
      for (const btn of btns) {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return true;
      }
      return false;
    }, undefined, { timeout: 10_000 });

    // Click the first confirm button that has a non-zero bounding rect
    await this.page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLElement>('[data-testid="confirm-button"]');
      for (const btn of btns) {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          btn.click();
          return;
        }
      }
    });
  }

  async approve(): Promise<void> {
    await this.approveButton.click();
    await this.clickConfirmButton();
    await this.waitForStatus('approved');
  }

  async claim(): Promise<void> {
    await this.claimButton.click();
    await this.clickConfirmButton();
    await this.waitForStatus('claimed');
  }
}
