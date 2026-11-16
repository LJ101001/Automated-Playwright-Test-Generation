/**
 * Feature: baseline-httpbookstoscrapecom-browse-all-books-on
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */

import { test, expect, type Page, type Locator } from '@playwright/test';

// ── Test data ─────────────────────────────────────────────────────────────────
const TEST_DATA = {
  baseUrl: 'http://books.toscrape.com',
  page2Url: 'http://books.toscrape.com/catalogue/page-2.html',
  page50Url: 'http://books.toscrape.com/catalogue/page-50.html',
  pageTitle: 'All products | Books to Scrape - Sandbox',
  mainHeading: 'All products',
  totalResults: 1000,
  booksPerPage: 20,
  totalPages: 50,
  firstBookTitle: 'A Light in the Attic',
  firstBookPrice: '£51.77',
  knownCategory: 'Travel',
  nonExistentCategory: 'Science Fiction Movies',
  page1Label: 'Page 1 of 50',
  page2Label: 'Page 2 of 50',
  page50Label: 'Page 50 of 50',
  pricePattern: /^£\d+\.\d{2}$/,
} as const;

// ── Page Object Model ─────────────────────────────────────────────────────────
class BooksHomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly bookItems: Locator;
  readonly paginationCurrent: Locator;
  readonly nextPageLink: Locator;
  readonly previousPageLink: Locator;
  readonly sidebarLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.bookItems = page.locator('article.product_pod');
    this.paginationCurrent = page.locator('ul.pager li.current');
    this.nextPageLink = page.locator('ul.pager li.next a');
    this.previousPageLink = page.locator('ul.pager li.previous a');
    this.sidebarLinks = page.locator('.side_categories a');
  }

  async goto() {
    await this.page.goto(TEST_DATA.baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoPage(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  bookTitle(index: number): Locator {
    return this.bookItems.nth(index).locator('h3 a');
  }

  bookPrice(index: number): Locator {
    return this.bookItems.nth(index).locator('.price_color');
  }

  bookRating(index: number): Locator {
    return this.bookItems.nth(index).locator('p.star-rating');
  }

  bookAvailability(index: number): Locator {
    return this.bookItems.nth(index).locator('.availability');
  }

  bookAddToBasket(index: number): Locator {
    return this.bookItems.nth(index).locator('button.btn-primary');
  }

  async getAllBookTitles(): Promise<string[]> {
    return this.page
      .locator('article.product_pod h3 a')
      .evaluateAll(els => els.map(el => (el as HTMLAnchorElement).getAttribute('title') ?? ''));
  }

  async getAllBookPrices(): Promise<string[]> {
    return this.page.locator('article.product_pod .price_color').allInnerTexts();
  }

  async getSidebarCategoryNames(): Promise<string[]> {
    const texts = await this.sidebarLinks.allInnerTexts();
    return texts.map(t => t.trim());
  }

  async getTotalResultCount(): Promise<number> {
    const strongs = await this.page.locator('strong').allInnerTexts();
    return Number(strongs[0]);
  }
}

// ── Viewport – must be top-level, never inside describe ───────────────────────
test.use({ viewport: { width: 1280, height: 800 } });

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe('Browse All Books – Homepage', () => {
  let homePage: BooksHomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new BooksHomePage(page);
    await homePage.goto();
  });

  // ── Positive Tests ──────────────────────────────────────────────────────────

  // TC-001-P :: Homepage loads with correct heading and page title [FR-01]
  test('TC-001-P :: homepage displays correct heading and page title', async ({ page }) => {
    await expect(homePage.heading).toBeVisible();
    await expect(homePage.heading).toContainText(TEST_DATA.mainHeading);
    await expect(page).toHaveTitle(TEST_DATA.pageTitle);
  });

  // TC-002-P :: Homepage displays exactly 20 book items per page [FR-02]
  test('TC-002-P :: homepage displays exactly 20 book items', async () => {
    await expect(homePage.bookItems).toHaveCount(TEST_DATA.booksPerPage);
  });

  // TC-003-P :: First book has title, price, star-rating and availability [FR-03]
  test('TC-003-P :: first book displays title, price, rating and availability', async () => {
    await expect(homePage.bookTitle(0)).toBeVisible();
    await expect(homePage.bookTitle(0)).toHaveAttribute('title', TEST_DATA.firstBookTitle);
    await expect(homePage.bookPrice(0)).toBeVisible();
    await expect(homePage.bookPrice(0)).toContainText(TEST_DATA.firstBookPrice);
    await expect(homePage.bookRating(0)).toBeVisible();
    await expect(homePage.bookAvailability(0)).toContainText('In stock');
  });

  // TC-004-P :: Result count shows 1000 total books and pagination shows page 1 of 50 [FR-04, FR-05]
  test('TC-004-P :: total result count is 1000 and pagination shows page 1 of 50', async () => {
    const total = await homePage.getTotalResultCount();
    expect(total).toBe(TEST_DATA.totalResults);
    await expect(homePage.paginationCurrent).toBeVisible();
    await expect(homePage.paginationCurrent).toContainText(TEST_DATA.page1Label);
  });

  // TC-005-P :: Sidebar displays known book categories [FR-07]
  test('TC-005-P :: sidebar displays category navigation including Travel', async () => {
    await expect(homePage.sidebarLinks.first()).toBeVisible();
    const categories = await homePage.getSidebarCategoryNames();
    expect(categories.some(c => c.includes(TEST_DATA.knownCategory))).toBe(true);
  });

  // TC-006-P :: All Add to basket buttons are visible and enabled [FR-06]
  test('TC-006-P :: all 20 Add to basket buttons are visible and enabled', async () => {
    await expect(homePage.bookItems).toHaveCount(TEST_DATA.booksPerPage);
    for (let i = 0; i < TEST_DATA.booksPerPage; i++) {
      await expect(homePage.bookAddToBasket(i)).toBeVisible();
      await expect(homePage.bookAddToBasket(i)).toBeEnabled();
    }
  });

  // TC-007-P :: Next pagination link navigates to page 2 [FR-05]
  test('TC-007-P :: clicking next pagination link loads page 2 with 20 books', async ({ page }) => {
    await expect(homePage.nextPageLink).toBeVisible();
    await homePage.nextPageLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/page-2\.html/);
    await expect(homePage.paginationCurrent).toContainText(TEST_DATA.page2Label);
    await expect(homePage.bookItems).toHaveCount(TEST_DATA.booksPerPage);
  });

  // ── Negative / Edge-case Tests ──────────────────────────────────────────────

  // TC-008-F :: No book on the homepage has an empty or missing title [FR-03]
  test('TC-008-F :: no book has an empty or missing title attribute', async () => {
    const titles = await homePage.getAllBookTitles();
    expect(titles.length).toBe(TEST_DATA.booksPerPage);
    for (const title of titles) {
      expect(title.trim().length).toBeGreaterThan(0);
    }
  });

  // TC-009-F :: No book on the homepage has a zero or malformed price [FR-03]
  test('TC-009-F :: no book has a zero or malformed price', async () => {
    const prices = await homePage.getAllBookPrices();
    expect(prices.length).toBe(TEST_DATA.booksPerPage);
    for (const price of prices) {
      expect(price.trim()).toMatch(TEST_DATA.pricePattern);
      const amount = parseFloat(price.replace('£', ''));
      expect(amount).toBeGreaterThan(0);
    }
  });

  // TC-010-F :: First page does not show a previous pagination button [FR-05]
  test('TC-010-F :: first page has no previous pagination link', async () => {
    await expect(homePage.previousPageLink).toHaveCount(0);
  });

  // TC-011-F :: Last page (page 50) has no next pagination button [FR-05]
  test('TC-011-F :: last page has no next pagination link and shows page 50 of 50', async () => {
    await homePage.gotoPage(TEST_DATA.page50Url);
    await expect(homePage.nextPageLink).toHaveCount(0);
    await expect(homePage.paginationCurrent).toContainText(TEST_DATA.page50Label);
  });

  // TC-012-F :: Sidebar does not contain a non-existent category [FR-07]
  test('TC-012-F :: sidebar does not list a non-existent category', async () => {
    const categories = await homePage.getSidebarCategoryNames();
    expect(categories.some(c => c.includes(TEST_DATA.nonExistentCategory))).toBe(false);
  });
});
