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
  unfilteredResultsText: '1000 results',
  filteredResultsText: '32 results',
  booksOnFirstPage: 20,
  booksOnSecondPage: 12,
  firstBookTitle: 'Sharp Objects',
  priceFormat: /^£\d+\.\d{2}$/,
  inStockText: 'In stock',
  secondPagePath: '/catalogue/category/books/mystery_3/page-2.html',
  nonExistentPagePath: '/catalogue/category/books/mystery_3/page-99.html',
  nonExistentCategoryPath: '/catalogue/category/books/not-a-real-genre_999/index.html',
  nextLinkText: 'next',
};

class BooksToScrapePage {
  readonly page: Page;
  readonly sidebarCategoryLinks: Locator;
  readonly pageHeading: Locator;
  readonly breadcrumbItems: Locator;
  readonly resultsBanner: Locator;
  readonly bookPods: Locator;
  readonly nextPageLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebarCategoryLinks = page.locator('.side_categories ul li ul li a');
    this.pageHeading = page.locator('h1');
    this.breadcrumbItems = page.locator('.breadcrumb li');
    this.resultsBanner = page.locator('.form-horizontal');
    this.bookPods = page.locator('.product_pod');
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

  bookPriceAt(index: number): Locator {
    return this.bookPods.nth(index).locator('.price_color');
  }

  bookAvailabilityAt(index: number): Locator {
    return this.bookPods.nth(index).locator('.instock.availability');
  }
}

test.describe('Filter books by the Mystery category', () => {
  // TC-001-P :: Mystery category link is visible and enabled in the homepage sidebar [FR-01]
  test('homepage sidebar exposes an enabled Mystery category link', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoHome();

    const mysteryLink = pom.categoryLinkByName(TEST_DATA.categoryName);
    await expect(mysteryLink).toBeVisible();
    await expect(mysteryLink).toBeEnabled();
  });

  // TC-002-P :: clicking the Mystery link navigates to the dedicated category URL [FR-02]
  test('clicking Mystery navigates to the Mystery catalogue page', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoHome();

    await pom.filterByCategory(TEST_DATA.categoryName);

    await expect(page).toHaveURL(new RegExp(TEST_DATA.categoryPath.replace(/\//g, '\\/')));
    await expect(page).toHaveTitle(TEST_DATA.categoryPageTitle);
  });

  // TC-003-P :: Mystery page heading and breadcrumb trail confirm the filter applied [FR-03]
  test('Mystery page shows correct heading and breadcrumb trail', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.categoryPath);

    await expect(pom.pageHeading).toContainText(TEST_DATA.categoryHeading);
    await expect(pom.breadcrumbItems).toHaveText(TEST_DATA.breadcrumbTrail);
  });

  // TC-004-P :: filtered result set displays correct count, title, price format and stock status [FR-04]
  test('Mystery page lists correctly formatted results on page one', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.categoryPath);

    await expect(pom.resultsBanner).toContainText(TEST_DATA.filteredResultsText);
    await expect(pom.bookPods).toHaveCount(TEST_DATA.booksOnFirstPage);
    await expect(pom.bookTitleAt(0)).toHaveAttribute('title', TEST_DATA.firstBookTitle);
    await expect(pom.bookPriceAt(0)).toHaveText(TEST_DATA.priceFormat);
    await expect(pom.bookAvailabilityAt(0)).toContainText(TEST_DATA.inStockText);
  });

  // TC-005-F :: applying the Mystery filter reduces the catalogue from the full 1000 results, proving the filter is not a no-op [FR-04]
  test('unfiltered homepage total differs from the filtered Mystery total', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoHome();
    await expect(pom.resultsBanner).toContainText(TEST_DATA.unfilteredResultsText);

    await pom.filterByCategory(TEST_DATA.categoryName);
    await expect(pom.resultsBanner).toContainText(TEST_DATA.filteredResultsText);
    await expect(pom.resultsBanner).not.toContainText(TEST_DATA.unfilteredResultsText);
  });

  // TC-006-F :: pagination exhausts exactly at 32 results with no further "next" link on the final page [FR-05]
  test('final Mystery page has no next-page link once all 32 results are shown', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    await pom.gotoPath(TEST_DATA.categoryPath);

    await expect(pom.nextPageLink).toContainText(TEST_DATA.nextLinkText);
    await pom.goToNextPage();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.secondPagePath.replace(/\//g, '\\/')));
    await expect(pom.bookPods).toHaveCount(TEST_DATA.booksOnSecondPage);
    await expect(pom.nextPageLink).toHaveCount(0);
  });

  // TC-007-F :: requesting an out-of-range Mystery pagination page returns 404 rather than an empty listing [FR-06]
  test('requesting an out-of-range Mystery pagination page returns 404', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    const response = await pom.gotoPath(TEST_DATA.nonExistentPagePath);

    expect(response?.status()).toBe(404);
  });

  // TC-008-F :: requesting a non-existent category slug returns 404 rather than silently showing all books [FR-06]
  test('requesting a non-existent category slug returns 404', async ({ page }) => {
    const pom = new BooksToScrapePage(page);
    const response = await pom.gotoPath(TEST_DATA.nonExistentCategoryPath);

    expect(response?.status()).toBe(404);
  });
});
