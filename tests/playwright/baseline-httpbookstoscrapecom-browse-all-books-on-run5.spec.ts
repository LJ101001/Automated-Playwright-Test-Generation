/**
 * Feature: baseline-httpbookstoscrapecom-browse-all-books-on
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */

import { test, expect, Page } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  rootPath: '/',
  page2Path: '/catalogue/page-2.html',
  lastPagePath: '/catalogue/page-50.html',
  outOfRangePagePath: '/catalogue/page-9999.html',
  nonexistentProductPath: '/catalogue/not-a-real-book_99999/index.html',
  firstProductPath: '/catalogue/a-light-in-the-attic_1000/index.html',
  pageHeaderText: 'All products',
  expectedBooksPerPage: 20,
  expectedCategoryCount: 50,
  firstBookTitle: 'A Light in the Attic',
  firstBookPrice: '£51.77',
  firstCategoryName: 'Travel',
};

class BooksHomePage {
  constructor(private readonly page: Page) {}

  async goto(path: string = TEST_DATA.rootPath) {
    return this.page.goto(path);
  }

  get pageHeader() {
    return this.page.locator('.page-header h1');
  }

  get productPods() {
    return this.page.locator('.product_pod');
  }

  get nextLink() {
    return this.page.locator('li.next a');
  }

  get sideCategoryLinks() {
    return this.page.locator('.side_categories ul li ul li a');
  }

  productTitleLink(index: number) {
    return this.productPods.nth(index).locator('h3 a');
  }

  productPrice(index: number) {
    return this.productPods.nth(index).locator('.price_color');
  }

  productAvailability(index: number) {
    return this.productPods.nth(index).locator('.availability');
  }

  categoryLink(name: string) {
    return this.sideCategoryLinks.filter({ hasText: name });
  }

  get detailTitle() {
    return this.page.locator('.product_main h1');
  }

  async clickNext() {
    await this.nextLink.click();
  }

  async clickFirstProductTitle() {
    await this.productTitleLink(0).click();
  }
}

test.describe('Browse all books on the homepage', () => {
  // TC-001-P :: homepage loads and displays the "All products" page header [FR-01]
  test('TC-001-P :: homepage displays the All products header', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto();
    await expect(books.pageHeader).toBeVisible();
    await expect(books.pageHeader).toContainText(TEST_DATA.pageHeaderText);
  });

  // TC-002-P :: homepage lists 20 book products on a single page [FR-02]
  test('TC-002-P :: homepage lists 20 book products', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto();
    await expect(books.productPods).toHaveCount(TEST_DATA.expectedBooksPerPage);
  });

  // TC-003-P :: each book pod displays a title, price and availability [FR-02]
  test('TC-003-P :: first book pod displays title, price and availability', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto();
    await expect(books.productTitleLink(0)).toHaveAttribute('title', TEST_DATA.firstBookTitle);
    await expect(books.productPrice(0)).toContainText(TEST_DATA.firstBookPrice);
    await expect(books.productAvailability(0)).toContainText('In stock');
  });

  // TC-004-P :: clicking next paginates to page 2 and shows a new set of books [FR-03]
  test('TC-004-P :: next link navigates to page 2', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto();
    await books.clickNext();
    await expect(page).toHaveURL(/catalogue\/page-2\.html/);
    await expect(books.productPods).toHaveCount(TEST_DATA.expectedBooksPerPage);
  });

  // TC-005-P :: clicking a book title navigates to its product detail page [FR-04]
  test('TC-005-P :: clicking a book title opens its detail page', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto();
    await books.clickFirstProductTitle();
    await expect(page).toHaveURL(/a-light-in-the-attic_1000/);
    await expect(books.detailTitle).toContainText(TEST_DATA.firstBookTitle);
  });

  // TC-006-P :: sidebar exposes 50 browsable category links [FR-05]
  test('TC-006-P :: sidebar displays 50 category links including Travel', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto();
    await expect(books.sideCategoryLinks).toHaveCount(TEST_DATA.expectedCategoryCount);
    await expect(books.categoryLink(TEST_DATA.firstCategoryName)).toBeVisible();
  });

  // TC-007-F :: the final page (50) has no next link, bounding pagination [FR-03]
  test('TC-007-F :: last page of results has no next link', async ({ page }) => {
    const books = new BooksHomePage(page);
    await books.goto(TEST_DATA.lastPagePath);
    await expect(books.productPods).toHaveCount(TEST_DATA.expectedBooksPerPage);
    await expect(books.nextLink).toHaveCount(0);
  });

  // TC-008-F :: requesting a page number beyond the catalogue returns 404 [FR-03]
  test('TC-008-F :: out-of-range page number returns 404', async ({ page }) => {
    const response = await page.goto(TEST_DATA.outOfRangePagePath);
    expect(response?.status()).toBe(404);
  });

  // TC-009-F :: requesting a nonexistent product slug returns 404 [FR-04]
  test('TC-009-F :: nonexistent product detail page returns 404', async ({ page }) => {
    const response = await page.goto(TEST_DATA.nonexistentProductPath);
    expect(response?.status()).toBe(404);
  });
});

