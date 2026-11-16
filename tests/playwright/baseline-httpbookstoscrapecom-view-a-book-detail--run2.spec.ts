/**
 * Feature: baseline-httpbookstoscrapecom-view-a-book-detail-
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, Page } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  homePath: '/index.html',
  book: {
    title: 'A Light in the Attic',
    path: '/catalogue/a-light-in-the-attic_1000/index.html',
    price: '£51.77',
    priceExclTax: '£51.77',
    priceInclTax: '£51.77',
    availabilityText: 'In stock (22 available)',
    upc: 'a897fe39b1053632',
  },
  nonexistentBookPath: '/catalogue/nonexistent-book_9999/index.html',
  malformedCataloguePath: '/catalogue/index.html',
  availabilityPattern: /^In stock \(\d+ available\)$/,
};

class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(TEST_DATA.homePath);
  }

  bookLinkByTitle(title: string) {
    return this.page.locator(`article.product_pod h3 a[title="${title}"]`);
  }
}

class BookDetailPage {
  readonly page: Page;
  readonly heading;
  readonly price;
  readonly availability;
  readonly breadcrumbActive;
  readonly productTable;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('div.product_main h1');
    this.price = page.locator('div.product_main p.price_color');
    this.availability = page.locator('div.product_main p.instock.availability');
    this.breadcrumbActive = page.locator('ul.breadcrumb li.active');
    this.productTable = page.locator('table.table-striped');
  }

  async goto(path: string) {
    return this.page.goto(path);
  }

  tableRowValue(fieldLabel: string) {
    return this.productTable.locator('tr', { has: this.page.locator(`th:text-is("${fieldLabel}")`) }).locator('td');
  }
}

test.describe('Book detail page — title, price, availability', () => {
  // TC-001-P :: book detail page displays the correct title [FR-01]
  test('TC-001-P displays the correct book title', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.book.path);

    await expect(detailPage.heading).toBeVisible();
    await expect(detailPage.heading).toContainText(TEST_DATA.book.title);
  });

  // TC-002-P :: book detail page displays the correct price in GBP format [FR-02]
  test('TC-002-P displays the correct book price', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.book.path);

    await expect(detailPage.price).toBeVisible();
    await expect(detailPage.price).toContainText(TEST_DATA.book.price);
  });

  // TC-003-P :: book detail page displays in-stock availability with quantity [FR-03]
  test('TC-003-P displays the correct availability status', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.book.path);

    await expect(detailPage.availability).toBeVisible();
    await expect(detailPage.availability).toContainText(TEST_DATA.book.availabilityText);
  });

  // TC-004-P :: navigating from the homepage listing to a book opens the matching detail page [FR-04]
  test('TC-004-P navigates from homepage listing to the matching detail page', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new BookDetailPage(page);
    await homePage.goto();

    await homePage.bookLinkByTitle(TEST_DATA.book.title).click();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.book.path.replace(/\//g, '\\/')));
    await expect(detailPage.heading).toContainText(TEST_DATA.book.title);
  });

  // TC-005-P :: breadcrumb reflects the current book as the active, final crumb [FR-05]
  test('TC-005-P shows the book title as the active breadcrumb', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.book.path);

    await expect(detailPage.breadcrumbActive).toBeVisible();
    await expect(detailPage.breadcrumbActive).toContainText(TEST_DATA.book.title);
  });

  // TC-006-F :: navigating to a non-existent book detail URL returns 404 [FR-06]
  test('TC-006-F returns 404 for a non-existent book URL', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    const response = await detailPage.goto(TEST_DATA.nonexistentBookPath);

    expect(response?.status()).toBe(404);
  });

  // TC-007-F :: navigating to a malformed catalogue path (missing product slug) returns 404 [FR-06]
  test('TC-007-F returns 404 for a malformed catalogue path', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    const response = await detailPage.goto(TEST_DATA.malformedCataloguePath);

    expect(response?.status()).toBe(404);
  });

  // TC-008-F :: product information table price fields stay consistent with the displayed price, guarding against stale/mismatched data [FR-07]
  test('TC-008-F keeps product table price fields consistent with the displayed price', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.book.path);

    await expect(detailPage.tableRowValue('Price (excl. tax)')).toHaveText(TEST_DATA.book.priceExclTax);
    await expect(detailPage.tableRowValue('Price (incl. tax)')).toHaveText(TEST_DATA.book.priceInclTax);
    await expect(detailPage.tableRowValue('UPC')).toHaveText(TEST_DATA.book.upc);
  });

  // TC-009-F :: availability text follows the expected "In stock (N available)" pattern rather than an unexpected/blank format [FR-08]
  test('TC-009-F availability text matches the expected stock pattern', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.book.path);

    const availabilityText = (await detailPage.availability.textContent())?.trim();
    expect(availabilityText).toMatch(TEST_DATA.availabilityPattern);
  });
});
