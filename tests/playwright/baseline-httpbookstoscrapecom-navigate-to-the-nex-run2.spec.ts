/**
 * Feature: baseline-httpbookstoscrapecom-navigate-to-the-nex
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */

import { test, expect, Page, Locator } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  homeUrl: '/',
  page1Url: '/index.html',
  catalogPage1Url: '/catalogue/page-1.html',
  page2Url: '/catalogue/page-2.html',
  page3Url: '/catalogue/page-3.html',
  lastPageUrl: '/catalogue/page-50.html',
  beyondLastPageUrl: '/catalogue/page-51.html',
  totalPages: 50,
  productsPerPage: 20,
  pageHeading: 'All products',
  page1PaginationText: 'Page 1 of 50',
  page2PaginationText: 'Page 2 of 50',
  lastPagePaginationText: 'Page 50 of 50',
  nextLinkText: 'next',
  previousLinkText: 'previous',
};

class CatalogPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly pager: Locator;
  readonly nextLink: Locator;
  readonly previousLink: Locator;
  readonly currentPageIndicator: Locator;
  readonly productPods: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.pager = page.locator('ul.pager');
    this.nextLink = page.locator('ul.pager li.next a');
    this.previousLink = page.locator('ul.pager li.previous a');
    this.currentPageIndicator = page.locator('ul.pager li.current');
    this.productPods = page.locator('article.product_pod');
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async clickNext() {
    await this.nextLink.click();
  }

  async clickPrevious() {
    await this.previousLink.click();
  }

  async getFirstBookTitle(): Promise<string | null> {
    return this.productPods.first().locator('h3 a').getAttribute('title');
  }
}

// TC-001-P :: homepage loads with heading and first page of results [FR-01]
test('homepage displays "All products" heading and page 1 pagination status', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.homeUrl);

  await expect(catalog.heading).toContainText(TEST_DATA.pageHeading);
  await expect(catalog.currentPageIndicator).toContainText(TEST_DATA.page1PaginationText);
  await expect(catalog.productPods).toHaveCount(TEST_DATA.productsPerPage);
});

// TC-002-P :: clicking "next" navigates from page 1 to page 2 [FR-02]
test('clicking next navigates from page 1 to page 2', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.homeUrl);

  await expect(catalog.nextLink).toBeVisible();
  await expect(catalog.nextLink).toContainText(TEST_DATA.nextLinkText);
  await catalog.clickNext();

  await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Url.replace('/', '\\/') + '$'));
  await expect(catalog.currentPageIndicator).toContainText(TEST_DATA.page2PaginationText);
});

// TC-003-P :: next page shows a different set of books than the previous page [FR-03]
test('next page displays different book results than the first page', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.homeUrl);
  const page1FirstTitle = await catalog.getFirstBookTitle();

  await catalog.clickNext();
  const page2FirstTitle = await catalog.getFirstBookTitle();

  expect(page2FirstTitle).not.toEqual(page1FirstTitle);
  await expect(catalog.productPods).toHaveCount(TEST_DATA.productsPerPage);
});

// TC-004-P :: a "previous" link becomes available after navigating forward, and returns to page 1 [FR-04]
test('previous link appears on page 2 and navigates back to page 1', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.page2Url);

  await expect(catalog.previousLink).toBeVisible();
  await expect(catalog.previousLink).toContainText(TEST_DATA.previousLinkText);
  await catalog.clickPrevious();

  await expect(page).toHaveURL(new RegExp(TEST_DATA.catalogPage1Url.replace('/', '\\/') + '$'));
  await expect(catalog.currentPageIndicator).toContainText(TEST_DATA.page1PaginationText);
});

// TC-005-P :: repeated "next" clicks advance sequentially through multiple pages [FR-02]
test('multiple sequential next clicks advance through pages 1, 2 and 3', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.homeUrl);

  await catalog.clickNext();
  await expect(catalog.currentPageIndicator).toContainText(TEST_DATA.page2PaginationText);

  await catalog.clickNext();
  await expect(catalog.currentPageIndicator).toContainText('Page 3 of 50');
  await expect(page).toHaveURL(new RegExp(TEST_DATA.page3Url.replace('/', '\\/') + '$'));
});

// TC-006-F :: the "next" link is absent on the final page of results [FR-05]
test('next link is not present on the final page (page 50)', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.lastPageUrl);

  await expect(catalog.currentPageIndicator).toContainText(TEST_DATA.lastPagePaginationText);
  await expect(catalog.nextLink).toHaveCount(0);
});

// TC-007-F :: the "previous" link is absent on the first page of results [FR-05]
test('previous link is not present on the first page', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto(TEST_DATA.homeUrl);

  await expect(catalog.currentPageIndicator).toContainText(TEST_DATA.page1PaginationText);
  await expect(catalog.previousLink).toHaveCount(0);
});

// TC-008-F :: requesting a page number beyond the last page does not return a normal catalog page [FR-06]
test('navigating directly to a page beyond the last page returns a non-success response', async ({ page }) => {
  const response = await page.goto(TEST_DATA.beyondLastPageUrl);

  expect(response).not.toBeNull();
  expect(response!.ok()).toBeFalsy();
});
