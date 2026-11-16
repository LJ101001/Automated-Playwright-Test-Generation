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
  books: [
    {
      path: '/catalogue/a-light-in-the-attic_1000/index.html',
      title: 'A Light in the Attic',
      price: '£51.77',
      availabilityText: 'In stock (22 available)',
    },
    {
      path: '/catalogue/soumission_998/index.html',
      title: 'Soumission',
      price: '£50.10',
      availabilityText: 'In stock (20 available)',
    },
    {
      path: '/catalogue/sharp-objects_997/index.html',
      title: 'Sharp Objects',
      price: '£53.74',
      availabilityText: 'In stock (20 available)',
    },
  ],
  nonexistentBookPath: '/catalogue/nonexistent-book_9999/index.html',
  malformedBookPath: '/catalogue/A-Light-In-The-Attic_ABCD/index.html',
};

class HomePage {
  readonly page: Page;
  readonly bookLinks;

  constructor(page: Page) {
    this.page = page;
    this.bookLinks = page.locator('.product_pod h3 a');
  }

  async goto() {
    await this.page.goto(TEST_DATA.homePath);
  }

  bookLinkByTitle(title: string) {
    return this.page.locator(`.product_pod h3 a[title="${title}"]`);
  }
}

class BookDetailPage {
  readonly page: Page;
  readonly title;
  readonly price;
  readonly availability;
  readonly breadcrumbActive;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.product_main h1');
    this.price = page.locator('.product_main p.price_color');
    this.availability = page.locator('.product_main p.instock.availability');
    this.breadcrumbActive = page.locator('ul.breadcrumb li.active');
  }

  async goto(path: string) {
    return this.page.goto(path);
  }
}

test.describe('Book detail page — title, price, availability', () => {
  // TC-001-P :: book detail page displays the correct title [FR-01]
  test('TC-001-P displays the correct book title', async ({ page }) => {
    const book = TEST_DATA.books[0];
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(book.path);

    await expect(detailPage.title).toBeVisible();
    await expect(detailPage.title).toContainText(book.title);
  });

  // TC-002-P :: book detail page displays the correct price in GBP format [FR-02]
  test('TC-002-P displays the correct book price', async ({ page }) => {
    const book = TEST_DATA.books[1];
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(book.path);

    await expect(detailPage.price).toBeVisible();
    await expect(detailPage.price).toContainText(book.price);
  });

  // TC-003-P :: book detail page displays in-stock availability with quantity [FR-03]
  test('TC-003-P displays the correct availability status', async ({ page }) => {
    const book = TEST_DATA.books[2];
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(book.path);

    await expect(detailPage.availability).toBeVisible();
    await expect(detailPage.availability).toContainText(book.availabilityText);
  });

  // TC-004-P :: navigating from the homepage listing to a book opens the matching detail page [FR-04]
  test('TC-004-P navigates from homepage listing to the matching detail page', async ({ page }) => {
    const book = TEST_DATA.books[0];
    const homePage = new HomePage(page);
    const detailPage = new BookDetailPage(page);
    await homePage.goto();

    await homePage.bookLinkByTitle(book.title).click();

    await expect(page).toHaveURL(new RegExp(book.path.replace(/\//g, '\\/')));
    await expect(detailPage.title).toContainText(book.title);
    await expect(detailPage.breadcrumbActive).toContainText(book.title);
  });

  // TC-005-F :: navigating to a non-existent book detail URL returns 404 [FR-05]
  test('TC-005-F returns 404 for a non-existent book URL', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    const response = await detailPage.goto(TEST_DATA.nonexistentBookPath);

    expect(response?.status()).toBe(404);
  });

  // TC-006-F :: price on the detail page reflects the primary book, not a related-product price shown lower on the page [FR-02]
  test('TC-006-F does not confuse the primary price with related-product prices', async ({ page }) => {
    const book = TEST_DATA.books[0];
    const detailPage = new BookDetailPage(page);
    await detailPage.goto(book.path);

    await expect(detailPage.price).toHaveCount(1);
    await expect(detailPage.price).toHaveText(book.price);
  });

  // TC-007-F :: navigating to a malformed book identifier returns 404 rather than a partial/incorrect page [FR-05]
  test('TC-007-F returns 404 for a malformed book identifier', async ({ page }) => {
    const detailPage = new BookDetailPage(page);
    const response = await detailPage.goto(TEST_DATA.malformedBookPath);

    expect(response?.status()).toBe(404);
  });
});
