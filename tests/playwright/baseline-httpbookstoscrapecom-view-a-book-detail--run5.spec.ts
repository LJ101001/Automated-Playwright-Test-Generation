/**
 * Feature: baseline-httpbookstoscrapecom-view-a-book-detail-
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  primaryBook: {
    path: '/catalogue/a-light-in-the-attic_1000/index.html',
    title: 'A Light in the Attic',
    price: '£51.77',
    availability: 'In stock (22 available)',
    upc: 'a897fe39b1053632',
    ratingClass: 'star-rating Three',
  },
  secondaryBook: {
    path: '/catalogue/soumission_998/index.html',
    title: 'Soumission',
    price: '£50.10',
    ratingClass: 'star-rating One',
  },
  nonExistentBook: {
    path: '/catalogue/this-book-does-not-exist_99999/index.html',
  },
  malformedPath: '/catalogue/index.html',
  homePath: '/index.html',
};

class BookDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly starRating: Locator;
  readonly infoTable: Locator;
  readonly breadcrumbItems: Locator;
  readonly notFoundBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('div.product_main h1');
    this.price = page.locator('div.product_main p.price_color');
    this.availability = page.locator('div.product_main p.instock.availability');
    this.starRating = page.locator('div.product_main p.star-rating');
    this.infoTable = page.locator('table.table.table-striped');
    this.breadcrumbItems = page.locator('ul.breadcrumb li');
    this.notFoundBody = page.locator('body');
  }

  async goto(path: string) {
    return this.page.goto(path);
  }

  infoRowValue(label: string): Locator {
    return this.infoTable
      .locator('tr', { has: this.page.locator(`th:text-is("${label}")`) })
      .locator('td');
  }
}

class HomePage {
  readonly page: Page;
  readonly firstBookLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstBookLink = page.locator('article.product_pod h3 a').first();
  }

  async goto() {
    await this.page.goto(TEST_DATA.homePath);
  }
}

test.describe('Book detail page — title, price and availability', () => {
  // TC-001-P :: valid book detail page renders the correct title [FR-01]
  test('TC-001-P shows the correct book title', async ({ page }) => {
    const detail = new BookDetailPage(page);
    await detail.goto(TEST_DATA.primaryBook.path);

    await expect(detail.title).toBeVisible();
    await expect(detail.title).toContainText(TEST_DATA.primaryBook.title);
  });

  // TC-002-P :: valid book detail page renders the correct price [FR-02]
  test('TC-002-P shows the correct price', async ({ page }) => {
    const detail = new BookDetailPage(page);
    await detail.goto(TEST_DATA.primaryBook.path);

    await expect(detail.price).toBeVisible();
    await expect(detail.price).toContainText(TEST_DATA.primaryBook.price);
  });

  // TC-003-P :: valid book detail page renders the correct availability text [FR-03]
  test('TC-003-P shows the correct availability status', async ({ page }) => {
    const detail = new BookDetailPage(page);
    await detail.goto(TEST_DATA.primaryBook.path);

    await expect(detail.availability).toBeVisible();
    await expect(detail.availability).toContainText(TEST_DATA.primaryBook.availability);
  });

  // TC-004-P :: title, price and availability are consistent across a different book record [FR-01][FR-02][FR-04]
  test('TC-004-P shows correct, distinct data for a second book', async ({ page }) => {
    const detail = new BookDetailPage(page);
    await detail.goto(TEST_DATA.secondaryBook.path);

    await expect(detail.title).toContainText(TEST_DATA.secondaryBook.title);
    await expect(detail.price).toContainText(TEST_DATA.secondaryBook.price);
    await expect(detail.starRating).toHaveClass(TEST_DATA.secondaryBook.ratingClass);
  });

  // TC-005-P :: navigating from the homepage listing lands on the matching book detail page [FR-01][FR-05]
  test('TC-005-P navigates from the homepage to the correct detail page', async ({ page }) => {
    const home = new HomePage(page);
    const detail = new BookDetailPage(page);

    await home.goto();
    const linkedTitle = await home.firstBookLink.getAttribute('title');
    await home.firstBookLink.click();

    await expect(page).toHaveURL(/a-light-in-the-attic_1000/);
    await expect(detail.title).toContainText(linkedTitle ?? '');
  });

  // TC-006-P :: product information table's price and availability rows match the summary panel [FR-02][FR-03][FR-06]
  test('TC-006-P keeps the info table consistent with the summary panel', async ({ page }) => {
    const detail = new BookDetailPage(page);
    await detail.goto(TEST_DATA.primaryBook.path);

    await expect(detail.infoRowValue('UPC')).toHaveText(TEST_DATA.primaryBook.upc);
    await expect(detail.infoRowValue('Price (incl. tax)')).toHaveText(TEST_DATA.primaryBook.price);
    await expect(detail.infoRowValue('Availability')).toContainText(TEST_DATA.primaryBook.availability);
  });

  // TC-007-F :: a non-existent book URL returns 404 and renders no product content [FR-07]
  test('TC-007-F returns 404 for a non-existent book URL', async ({ page }) => {
    const detail = new BookDetailPage(page);
    const response = await detail.goto(TEST_DATA.nonExistentBook.path);

    expect(response?.status()).toBe(404);
    await expect(detail.title).not.toBeVisible();
    await expect(detail.price).not.toBeVisible();
  });

  // TC-008-F :: a malformed catalogue path missing the product slug returns 404 [FR-07]
  test('TC-008-F returns 404 for a malformed catalogue path', async ({ page }) => {
    const detail = new BookDetailPage(page);
    const response = await detail.goto(TEST_DATA.malformedPath);

    expect(response?.status()).toBe(404);
    await expect(detail.availability).not.toBeVisible();
  });

  // TC-009-F :: the breadcrumb's active crumb is the book title, not an ancestor category [FR-08]
  test('TC-009-F breadcrumb active item is the book title, not an ancestor crumb', async ({ page }) => {
    const detail = new BookDetailPage(page);
    await detail.goto(TEST_DATA.primaryBook.path);

    const lastCrumb = detail.breadcrumbItems.last();
    await expect(lastCrumb).toContainText(TEST_DATA.primaryBook.title);
    await expect(lastCrumb).not.toContainText('Home');
    await expect(lastCrumb).not.toContainText('Books');
  });
});
