/**
 * Feature: baseline-httpbookstoscrapecom-view-a-book-detail-
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  homepageUrl: '/index.html',
  validBook: {
    detailPath: '/catalogue/a-light-in-the-attic_1000/index.html',
    title: 'A Light in the Attic',
    price: '£51.77',
    availabilityText: 'In stock (22 available)',
    ratingClass: 'Three',
    upc: 'a897fe39b1053632',
  },
  secondBook: {
    detailPath: '/catalogue/soumission_998/index.html',
    title: 'Soumission',
    price: '£50.10',
    ratingClass: 'One',
  },
  nonExistentBookPath: '/catalogue/this-book-does-not-exist_9999/index.html',
  malformedPath: '/catalogue/index.html',
  breadcrumbHome: 'Home',
  breadcrumbBooks: 'Books',
};

class BookDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly breadcrumb: Locator;
  readonly breadcrumbActive: Locator;
  readonly productInfoTable: Locator;
  readonly starRating: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('div.product_main h1');
    this.price = page.locator('div.product_main p.price_color');
    this.availability = page.locator('div.product_main p.instock.availability');
    this.breadcrumb = page.locator('ul.breadcrumb li');
    this.breadcrumbActive = page.locator('ul.breadcrumb li.active');
    this.productInfoTable = page.locator('table.table-striped');
    this.starRating = page.locator('div.product_main p.star-rating');
  }

  async goto(path: string) {
    return this.page.goto(path);
  }

  tableRowValue(label: string): Locator {
    return this.productInfoTable
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
    await this.page.goto(TEST_DATA.homepageUrl);
  }
}

test.describe('Book detail page — title, price, availability', () => {
  // TC-001-P :: navigating directly to a valid book detail page shows the correct title [FR-01]
  test('TC-001-P displays the correct book title on the detail page', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.validBook.detailPath);

    await expect(detailPage.title).toBeVisible();
    await expect(detailPage.title).toContainText(TEST_DATA.validBook.title);
  });

  // TC-002-P :: book detail page shows the correct price in GBP format [FR-02]
  test('TC-002-P displays the correct price on the detail page', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.validBook.detailPath);

    await expect(detailPage.price).toBeVisible();
    await expect(detailPage.price).toContainText(TEST_DATA.validBook.price);
  });

  // TC-003-P :: book detail page shows the correct availability text [FR-03]
  test('TC-003-P displays the correct availability status on the detail page', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.validBook.detailPath);

    await expect(detailPage.availability).toBeVisible();
    await expect(detailPage.availability).toContainText(TEST_DATA.validBook.availabilityText);
  });

  // TC-004-P :: navigating from the homepage's first book link lands on that book's detail page with matching title, price and stock [FR-01][FR-02][FR-03][FR-04]
  test('TC-004-P navigates from the homepage listing to the matching detail page', async ({ page }) => {
    const homePage = new HomePage(page);
    const detailPage = new BookDetailPage(page);

    await homePage.goto();
    const linkedTitle = await homePage.firstBookLink.getAttribute('title');
    await homePage.firstBookLink.click();

    await expect(page).toHaveURL(/a-light-in-the-attic_1000/);
    await expect(detailPage.title).toContainText(linkedTitle ?? '');
    await expect(detailPage.price).toBeVisible();
    await expect(detailPage.availability).toBeVisible();
  });

  // TC-005-P :: a second, distinct book detail page shows its own correct title, price and rating [FR-01][FR-02][FR-05]
  test('TC-005-P displays correct, distinct data for a second book', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.secondBook.detailPath);

    await expect(detailPage.title).toContainText(TEST_DATA.secondBook.title);
    await expect(detailPage.price).toContainText(TEST_DATA.secondBook.price);
    await expect(detailPage.starRating).toHaveClass(new RegExp(TEST_DATA.secondBook.ratingClass));
  });

  // TC-006-P :: product information table's price and availability rows are consistent with the summary panel [FR-02][FR-03][FR-06]
  test('TC-006-P keeps the product information table consistent with the summary panel', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.validBook.detailPath);

    await expect(detailPage.tableRowValue('UPC')).toHaveText(TEST_DATA.validBook.upc);
    await expect(detailPage.tableRowValue('Price (incl. tax)')).toHaveText(TEST_DATA.validBook.price);
    await expect(detailPage.tableRowValue('Availability')).toContainText(TEST_DATA.validBook.availabilityText);
  });

  // TC-007-F :: requesting a non-existent book detail URL returns 404 and renders no book content [FR-07]
  test('TC-007-F returns 404 and shows no product data for a non-existent book URL', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    const response = await detailPage.goto(TEST_DATA.nonExistentBookPath);

    expect(response?.status()).toBe(404);
    await expect(detailPage.title).not.toBeVisible();
    await expect(detailPage.price).not.toBeVisible();
  });

  // TC-008-F :: a malformed/incomplete catalogue path (missing product slug) returns 404 rather than a silent fallback page [FR-07]
  test('TC-008-F returns 404 for a malformed catalogue path missing a product slug', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    const response = await detailPage.goto(TEST_DATA.malformedPath);

    expect(response?.status()).toBe(404);
    await expect(detailPage.title).not.toBeVisible();
    await expect(detailPage.availability).not.toBeVisible();
  });

  // TC-009-F :: breadcrumb active item must be the book title, not the "Home" or "Books" crumb [FR-08]
  test('TC-009-F breadcrumb active item is the book title, not an ancestor crumb', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(TEST_DATA.validBook.detailPath);

    await expect(detailPage.breadcrumbActive).not.toContainText(TEST_DATA.breadcrumbHome);
    await expect(detailPage.breadcrumbActive).not.toContainText(TEST_DATA.breadcrumbBooks);
    await expect(detailPage.breadcrumbActive).toContainText(TEST_DATA.validBook.title);
  });
});
