/**
 * Feature: baseline-httpbookstoscrapecom-navigate-to-the-nex
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  homePath: '/index.html',
  catalogPage1Path: '/catalogue/page-1.html',
  page2Path: '/catalogue/page-2.html',
  page3Path: '/catalogue/page-3.html',
  lastPagePath: '/catalogue/page-50.html',
  nonexistentPagePath: '/catalogue/page-999.html',
  expectedProductsPerPage: 20,
  expectedPageHeading: 'All products',
  nextLinkText: 'next',
  previousLinkText: 'previous',
  page2FirstBookTitle: 'In Her Wake',
};

class BookListPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nextLink: Locator;
  readonly previousLink: Locator;
  readonly productPods: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.page-header h1');
    this.nextLink = page.locator('li.next a');
    this.previousLink = page.locator('li.previous a');
    this.productPods = page.locator('article.product_pod');
  }

  async goto(path: string) {
    return this.page.goto(path);
  }

  async clickNext() {
    await this.nextLink.click();
  }

  async clickPrevious() {
    await this.previousLink.click();
  }

  firstProductTitle(): Locator {
    return this.productPods.first().locator('h3 a');
  }
}

test.describe('Books to Scrape — navigate to the next page of results', () => {
  // TC-001-P :: home page loads with heading and 20 product listings [FR-01]
  test('home page displays "All products" heading and 20 book listings', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await expect(list.heading).toBeVisible();
    await expect(list.heading).toContainText(TEST_DATA.expectedPageHeading);
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  });

  // TC-002-P :: next link is visible and enabled on the first page [FR-02]
  test('next link is visible and enabled on the first page', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await expect(list.nextLink).toBeVisible();
    await expect(list.nextLink).toBeEnabled();
    await expect(list.nextLink).toContainText(TEST_DATA.nextLinkText);
  });

  // TC-003-P :: clicking next navigates to page 2 and loads a new set of books [FR-02]
  test('clicking next navigates to page 2 with a new set of books', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await list.clickNext();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Path.replace('/', '\\/') + '$'));
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
    await expect(list.firstProductTitle()).toHaveAttribute('title', TEST_DATA.page2FirstBookTitle);
  });

  // TC-004-P :: previous link appears on page 2 and returns to page 1 [FR-03]
  test('previous link appears on page 2 and navigates back to page 1', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.page2Path);

    await expect(list.previousLink).toBeVisible();
    await expect(list.previousLink).toContainText(TEST_DATA.previousLinkText);

    await list.clickPrevious();
    await expect(page).toHaveURL(new RegExp(TEST_DATA.catalogPage1Path.replace('/', '\\/') + '$'));
  });

  // TC-005-P :: repeated next navigation advances sequentially through pages [FR-02]
  test('repeated next clicks advance sequentially through pages 1, 2 and 3', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await list.clickNext();
    await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Path.replace('/', '\\/') + '$'));

    await list.clickNext();
    await expect(page).toHaveURL(new RegExp(TEST_DATA.page3Path.replace('/', '\\/') + '$'));
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  });

  // TC-006-F :: next link is absent on the final page of results [FR-04]
  test('next link is not present on the final page (page 50)', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.lastPagePath);

    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
    await expect(list.nextLink).toHaveCount(0);
  });

  // TC-007-F :: previous link is absent on the first page [FR-03]
  test('previous link is not present on the first page', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await expect(list.previousLink).toHaveCount(0);
  });

  // TC-008-F :: requesting a page number beyond the last page returns 404 [FR-04]
  test('navigating directly to a page beyond the last page returns 404', async ({ page }) => {
    const list = new BookListPage(page);
    const response = await list.goto(TEST_DATA.nonexistentPagePath);

    expect(response?.status()).toBe(404);
  });
});
