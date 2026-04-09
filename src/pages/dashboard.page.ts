import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // Locators
  readonly pageRoot: Locator;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly requestTable: Locator;
  readonly requestCount: Locator;
  readonly newRequestButton: Locator;
  readonly logoutButton: Locator;
  readonly emptyState: Locator;
  readonly filterBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageRoot = page.getByTestId('dashboard-page');
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.searchInput = page.getByTestId('search-input').first();
    this.statusFilter = page.getByTestId('status-filter').first();
    this.requestTable = page.getByTestId('request-table').first();
    this.requestCount = page.getByTestId('request-count').first();
    this.newRequestButton = page.getByTestId('new-request-button');
    this.logoutButton = page.getByTestId('logout-button');
    this.emptyState = page.getByTestId('empty-state').first();
    this.filterBar = page.getByTestId('filter-bar');
  }

  async waitForLoad(): Promise<void> {
    await this.pageRoot.waitFor({ state: 'visible' });
    await this.page.waitForURL('**/dashboard');
  }

  async searchByTitle(title: string): Promise<void> {
    await this.searchInput.fill(title);
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  async clickNewRequest(): Promise<void> {
    await this.newRequestButton.click();
  }

  /**
   * Clicks the "View" link for a specific request by its ID.
   * The table row is data-testid="request-row-{id}" and the link is data-testid="request-link-{id}".
   */
  async viewRequest(requestId: string): Promise<void> {
    await this.page.getByTestId(`request-link-${requestId}`).click();
  }

  /**
   * Finds a request by title and navigates to its detail page.
   * Extracts the href from the View link and navigates directly, avoiding
   * flaky click interactions caused by the table re-rendering after search.
   */
  async openRequest(title: string): Promise<void> {
    const row = this.page.locator('[data-testid^="request-row-"]', { hasText: title });
    await row.waitFor({ state: 'attached', timeout: 60_000 });
    const link = row.locator('[data-testid^="request-link-"]');
    const href = await link.getAttribute('href');
    if (href) {
      await this.page.goto(href);
    }
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL('**/login');
  }

  async getRequestRowCount(): Promise<number> {
    return this.page.locator('tbody tr').count();
  }

  async waitForRequestVisible(requestTitle: string, timeout = 60_000): Promise<void> {
    await expect(this.requestTable).toContainText(requestTitle, { timeout });
  }
}
