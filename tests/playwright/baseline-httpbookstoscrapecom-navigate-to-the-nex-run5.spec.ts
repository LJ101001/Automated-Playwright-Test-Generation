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
  page1Path: '/catalogue/page-1.html',
  page2Path: '/catalogue/page-2.html',
  page3Path: '/catalogue/page-3.html',
  lastPagePath: '/catalogue/page-50.html',
  nonexistentPagePath: '/catalogue/page-51.html',
  expectedProductsPerPage: 20,
  expectedPageHeading: 'All products',
  page1IndicatorText: 'Page 1 of 50',
  page2IndicatorText: 'Page 2 of 50',
  page3IndicatorText: 'Page 3 of 50',
  lastPageIndicatorText: 'Page 50 of 50',
  nextLinkText: 'next',
  previousLinkText: 'previous',
  page1FirstBookTitle: 'A Light in the Attic',
  page2FirstBookTitle: 'In Her Wake',
};

class BookListPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nextLink: Locator;
  readonly previousLink: Locator;
  readonly currentPageIndicator: Locator;
  readonly productPods: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.page-header h1');
    this.nextLink = page.locator('li.next a');
    this.previousLink = page.locator('li.previous a');
    this.currentPageIndicator = page.locator('.pager .current');
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
  // TC-001-P :: home page loads on page 1 with heading and 20 book listings [FR-01]
  test('TC-001-P: home page displays "All products" heading and page 1 of 50', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await expect(list.heading).toBeVisible();
    await expect(list.heading).toContainText(TEST_DATA.expectedPageHeading);
    await expect(list.currentPageIndicator).toContainText(TEST_DATA.page1IndicatorText);
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  });

  // TC-002-P :: next link is visible, enabled and correctly labelled on the first page [FR-02]
  test('TC-002-P: next link is visible and enabled on the first page', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await expect(list.nextLink).toBeVisible();
    await expect(list.nextLink).toBeEnabled();
    await expect(list.nextLink).toContainText(TEST_DATA.nextLinkText);
  });

  // TC-003-P :: clicking next navigates to page 2, updates the URL, pagination indicator and book list [FR-02]
  test('TC-003-P: clicking next navigates to page 2 with a new set of books', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await list.clickNext();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Path.replace(/\//g, '\\/') + '$'));
    await expect(list.currentPageIndicator).toContainText(TEST_DATA.page2IndicatorText);
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
    await expect(list.firstProductTitle()).toHaveAttribute('title', TEST_DATA.page2FirstBookTitle);
  });

  // TC-004-P :: previous link appears on page 2 and returns the user to page 1 [FR-03]
  test('TC-004-P: previous link appears on page 2 and navigates back to page 1', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.page2Path);

    await expect(list.previousLink).toBeVisible();
    await expect(list.previousLink).toContainText(TEST_DATA.previousLinkText);

    await list.clickPrevious();

    await expect(page).toHaveURL(new RegExp(TEST_DATA.page1Path.replace(/\//g, '\\/') + '$'));
    await expect(list.currentPageIndicator).toContainText(TEST_DATA.page1IndicatorText);
  });

  // TC-005-P :: repeated next navigation advances sequentially through pages 1, 2 and 3 [FR-02]
  test('TC-005-P: repeated next clicks advance sequentially through pages 1, 2 and 3', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await list.clickNext();
    await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Path.replace(/\//g, '\\/') + '$'));

    await list.clickNext();
    await expect(page).toHaveURL(new RegExp(TEST_DATA.page3Path.replace(/\//g, '\\/') + '$'));
    await expect(list.currentPageIndicator).toContainText(TEST_DATA.page3IndicatorText);
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  });

  // TC-006-F :: next link is absent on the final pagination page [FR-04]
  test('TC-006-F: next link is not present on the final page (page 50)', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.lastPagePath);

    await expect(list.currentPageIndicator).toContainText(TEST_DATA.lastPageIndicatorText);
    await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
    await expect(list.nextLink).toHaveCount(0);
  });

  // TC-007-F :: previous link is absent on the first page [FR-03]
  test('TC-007-F: previous link is not present on the first page', async ({ page }) => {
    const list = new BookListPage(page);
    await list.goto(TEST_DATA.homePath);

    await expect(list.previousLink).toHaveCount(0);
  });

  // TC-008-F :: requesting a catalogue page number beyond the last page returns a 404 response [FR-04]
  test('TC-008-F: navigating directly to a page beyond the last page returns 404', async ({ page }) => {
    const list = new BookListPage(page);
    const response = await list.goto(TEST_DATA.nonexistentPagePath);

    expect(response?.status()).toBe(404);
  });
});
