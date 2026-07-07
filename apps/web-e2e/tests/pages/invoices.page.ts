import { Page, Locator } from "@playwright/test";

export class InvoicesPage {
  readonly page: Page;
  readonly newInvoiceButton: Locator;
  readonly invoiceList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newInvoiceButton = page.locator('a[href*="/invoices/new"], button:has-text("New Invoice")');
    this.invoiceList = page.locator("table, [data-testid='invoice-list']");
  }

  async goto() {
    await this.page.goto("/invoices");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async clickNewInvoice() {
    await this.newInvoiceButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
