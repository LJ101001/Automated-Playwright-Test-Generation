/**
 * Feature: baseline-httpbookstoscrapecom-filter-books-by-the
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, Page, Locator } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  homePath: '/index.html',
  categoryName: 'Mystery',
  categoryPath: '/catalogue/category/books/mystery_3/index.html',
  categoryPageTitle: 'Mystery | Books to Scrape - Sandbox',
  categoryHeading: 'Mystery',
  breadcrumbTrail: ['Home', 'Books', 'Mystery'],
  totalResultsText: '32 results',
  booksOnFirstPage: 20,
  booksOnSecondPage: 12,
  totalBooks: 32,
  secondPagePath: '/catalogue/category/books/mystery_3/page-2.html',
  nonExistentPagePath: '/catalogue/category/books/mystery_3/page-99.html',
  nonExistentCategoryPath: '/catalogue/category/books/not-a-real-genre_999/index.html',
  nextLinkText: 'next',
  expectedFirstBookTitle: 'Sharp Objects',
};

class BooksToScrapePage {
  readonly page: Page;
  readonly sidebarCategoryLinks: Locator;
  readonly pageHeading: Locator;
  readonly breadcrumbItems: Locator;
  readonly resultsCountBanner: Locator;
  readonly bookPods: Locator;
  readonly activeCategoryLabel: Locator;
  readonly nextPageLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebarCategoryLinks = page.locator('.side_categories ul li ul li a');
    this.pageHeading = page.locator('h1');
    this.breadcrumbItems = page.locator('.breadcrumb li');
    this.resultsCountBanner = page.locator('.form-horizontal');
    this.bookPods = page.locator('.product_pod');
    this.activeCategoryLabel = page.locator('.side_categories strong');
    this.nextPageLink = page.locator('li.next a');
  }

  async gotoHome() {
    await this.page.goto(TEST_DATA.homePath);
  }

  async gotoPath(path: string) {
    return this.page.goto(path);
  }

  categoryLinkByName(name: string): Locator {
    return this.sidebarCategoryLinks.filter({ hasText: name });
  }

  async filterByCategory(name: string) {
    await this.categoryLinkByName(name).click();
  }

  async goToNextPage() {
    await this.nextPageLink.click();
  }

  bookTitleAt(index: number): Locator {
    return this.bookPods.nth(index).locator('h3 a');
  }
}

test.describe('Filter books by the Mystery category', () => {
  // TC-001-P :: sidebar exposes a clickable Mystery category link on the homepage [FR-01]
  test('homepage displays a Mystery category link in the sidebar', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoHome();

    const mysteryLink = pom.categoryLinkByName(TEST_DATA.categoryName);
    await expect(mysteryLink).toBeVisible();
    await expect(mysteryLink).toBeEnabled();
  });

  // TC-002-P :: clicking the Mystery category link navigates to the Mystery catalogue page [FR-02]
  test('clicking Mystery category navigates to the mystery catalogue URL', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoHome();

    await pom.filterByCategory(TEST_DATA.categoryName);

    await expect(page).toHaveURL(new RegExp(TEST_DATA.categoryPath.replace(/\//g, '\\/')));
    await expect(page).toHaveTitle(TEST_DATA.categoryPageTitle);
  });

  // TC-003-P :: Mystery page heading, breadcrumb and active sidebar state confirm the filter applied [FR-03]
  test('Mystery page shows correct heading and breadcrumb trail', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.categoryPath);

    await expect(pom.pageHeading).toContainText(TEST_DATA.categoryHeading);
    await expect(pom.breadcrumbItems).toHaveText(TEST_DATA.breadcrumbTrail);
    await expect(pom.activeCategoryLabel).toContainText(TEST_DATA.categoryName);
  });

  // TC-004-P :: filtered result count and first page book listing match the Mystery catalogue [FR-04]
  test('Mystery page lists the correct result count and books on page one', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.categoryPath);

    await expect(pom.resultsCountBanner).toContainText(TEST_DATA.totalResultsText);
    await expect(pom.bookPods).toHaveCount(TEST_DATA.booksOnFirstPage);
    await expect(pom.bookTitleAt(0)).toHaveAttribute('title', TEST_DATA.expectedFirstBookTitle);
  });

  // TC-005-P :: pagination "next" link surfaces the remaining Mystery results [FR-05]
  test('paginating to page two shows the remaining Mystery books', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.categoryPath);

    await expect(pom.nextPageLink).toContainText(TEST_DATA.nextLinkText);
    await pom.goToNextPage();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.secondPagePath.replace(/\//g, '\\/')));
    await expect(pom.bookPods).toHaveCount(TEST_DATA.booksOnSecondPage);
  });

  // TC-006-F :: requesting a pagination offset beyond the last Mystery page returns a 404 [FR-06]
  test('requesting an out-of-range Mystery pagination page returns 404', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    const response = await pom.gotoPath(TEST_DATA.nonExistentPagePath);

    expect(response?.status()).toBe(404);
  });

  // TC-007-F :: requesting a category slug that does not exist returns a 404 rather than an empty result set [FR-07]
  test('requesting a non-existent category slug returns 404', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    const response = await pom.gotoPath(TEST_DATA.nonExistentCategoryPath);

    expect(response?.status()).toBe(404);
  });

  // TC-008-F :: the second Mystery pagination page does not carry a further "next" link (results are exhausted at 32) [FR-05]
  test('final Mystery page has no next-page link once all 32 results are shown', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.secondPagePath);

    await expect(pom.bookPods).toHaveCount(TEST_DATA.booksOnSecondPage);
    await expect(pom.nextPageLink).toHaveCount(0);
  });
});
