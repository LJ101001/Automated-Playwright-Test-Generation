/**
 * Feature: baseline-httpbookstoscrapecom-filter-books-by-the
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, Page, Response, Locator } from '@playwright/test';

const TEST_DATA = {
  baseURL: 'http://books.toscrape.com',
  homePath: '/index.html',
  mysteryCategoryName: 'Mystery',
  mysteryCategoryPath: '/catalogue/category/books/mystery_3/index.html',
  mysteryCategoryPage2Path: '/catalogue/category/books/mystery_3/page-2.html',
  invalidCategoryPath: '/catalogue/category/books/nonexistent-category_999/index.html',
  expectedBreadcrumb: ['Home', 'Books', 'Mystery'],
  expectedResultCountPage1: '32 results - showing 1 to 20.',
  expectedResultCountPage2: '32 results - showing 21 to 32.',
  expectedProductCountPage1: 20,
  expectedProductCountPage2: 12,
  invalidPageStatus: 404,
  invalidPageTitle: '404 Not Found',
} as const;

test.use({ baseURL: TEST_DATA.baseURL });

class BooksCategoryPage {
  readonly page: Page;
  readonly mysteryLink: Locator;
  readonly pageHeading: Locator;
  readonly resultCountText: Locator;
  readonly breadcrumbItems: Locator;
  readonly productPods: Locator;
  readonly nextLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mysteryLink = page.getByRole('link', { name: TEST_DATA.mysteryCategoryName, exact: true });
    this.pageHeading = page.locator('.page-header h1');
    this.resultCountText = page.locator('.form-horizontal');
    this.breadcrumbItems = page.locator('.breadcrumb li');
    this.productPods = page.locator('.product_pod');
    this.nextLink = page.locator('.pager .next a');
  }

  async gotoHome(): Promise<Response | null> {
    return this.page.goto(TEST_DATA.homePath);
  }

  async gotoPath(path: string): Promise<Response | null> {
    return this.page.goto(path);
  }

  async clickMysteryCategory(): Promise<void> {
    await this.mysteryLink.click();
  }

  async clickNextPage(): Promise<void> {
    await this.nextLink.click();
  }
}

test.describe('books.toscrape.com — filter books by the Mystery category', () => {
  // TC-001-P :: user filters the catalogue by clicking the Mystery sidebar link [FR-01]
  test('TC-001-P: clicking the Mystery sidebar link filters to the Mystery category page', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    await catalog.gotoHome();

    await expect(catalog.mysteryLink).toBeVisible();
    await expect(catalog.mysteryLink).toBeEnabled();
    await catalog.clickMysteryCategory();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.mysteryCategoryPath.replace(/\//g, '\\/')));
    await expect(catalog.pageHeading).toContainText(TEST_DATA.mysteryCategoryName);
  });

  // TC-002-P :: filtered category page shows a breadcrumb trail confirming the active filter [FR-02]
  test('TC-002-P: Mystery category page displays a Home > Books > Mystery breadcrumb', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    await catalog.gotoPath(TEST_DATA.mysteryCategoryPath);

    await expect(catalog.breadcrumbItems).toHaveText([...TEST_DATA.expectedBreadcrumb]);
  });

  // TC-003-P :: filtered results display the correct result count and number of book cards [FR-03]
  test('TC-003-P: Mystery category page 1 shows correct result count text and 20 product cards', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    await catalog.gotoPath(TEST_DATA.mysteryCategoryPath);

    await expect(catalog.resultCountText).toContainText(TEST_DATA.expectedResultCountPage1);
    await expect(catalog.productPods).toHaveCount(TEST_DATA.expectedProductCountPage1);
  });

  // TC-004-P :: pagination within the filtered category advances to the next page of Mystery results [FR-04]
  test('TC-004-P: paginating within the Mystery category advances to page 2 with the remaining books', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    await catalog.gotoPath(TEST_DATA.mysteryCategoryPath);

    await expect(catalog.nextLink).toBeEnabled();
    await catalog.clickNextPage();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.mysteryCategoryPage2Path.replace(/\//g, '\\/')));
    await expect(catalog.resultCountText).toContainText(TEST_DATA.expectedResultCountPage2);
    await expect(catalog.productPods).toHaveCount(TEST_DATA.expectedProductCountPage2);
  });

  // TC-005-F :: the last page of filtered results has no further "next" pagination control (boundary case) [FR-04]
  test('TC-005-F: the final page of Mystery results has no next pagination link', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    await catalog.gotoPath(TEST_DATA.mysteryCategoryPage2Path);

    await expect(catalog.productPods).toHaveCount(TEST_DATA.expectedProductCountPage2);
    await expect(catalog.nextLink).toHaveCount(0);
  });

  // TC-006-F :: navigating directly to a category URL that does not exist returns a 404 (invalid filter target) [FR-06]
  test('TC-006-F: navigating to a nonexistent category URL returns a 404 page', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    const response = await catalog.gotoPath(TEST_DATA.invalidCategoryPath);

    expect(response?.status()).toBe(TEST_DATA.invalidPageStatus);
    await expect(page).toHaveTitle(TEST_DATA.invalidPageTitle);
  });

  // TC-007-F :: rendered product card count must never exceed the range declared in the result count text (data integrity edge case) [FR-03]
  test('TC-007-F: rendered card count on page 2 matches the declared "showing" range, not the page-1 total', async ({ page }) => {
    const catalog = new BooksCategoryPage(page);
    await catalog.gotoPath(TEST_DATA.mysteryCategoryPage2Path);

    const cardCount = await catalog.productPods.count();
    expect(cardCount).not.toBe(TEST_DATA.expectedProductCountPage1);
    expect(cardCount).toBe(TEST_DATA.expectedProductCountPage2);
  });
});
