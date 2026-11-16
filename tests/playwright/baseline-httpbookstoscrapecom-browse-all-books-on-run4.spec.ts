/**
 * Feature: baseline-httpbookstoscrapecom-browse-all-books-on
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, type Page, type Locator } from '@playwright/test';

const TEST_DATA = {
  baseUrl: 'http://books.toscrape.com',
  homeUrl: 'http://books.toscrape.com/index.html',
  page50Url: 'http://books.toscrape.com/catalogue/page-50.html',
  invalidPageUrl: 'http://books.toscrape.com/catalogue/page-9999.html',
  pageTitle: 'All products | Books to Scrape - Sandbox',
  mainHeading: 'All products',
  logoText: 'Books to Scrape',
  totalResultsText: '1000',
  booksPerPage: 20,
  firstBookTitle: 'A Light in the Attic',
  firstBookPrice: '£51.77',
  firstBookStock: 'In stock',
  sampleCategory: 'Travel',
  pricePattern: /^£\d+\.\d{2}$/,
} as const;

class BooksHomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly logo: Locator;
  readonly bookItems: Locator;
  readonly nextPageLink: Locator;
  readonly sidebarLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.logo = page.locator('div.col-sm-8.h1 a');
    this.bookItems = page.locator('article.product_pod');
    this.nextPageLink = page.locator('ul.pager li.next a');
    this.sidebarLinks = page.locator('.side_categories a');
  }

  async goto() {
    await this.page.goto(TEST_DATA.baseUrl);
  }

  async gotoUrl(url: string) {
    return this.page.goto(url);
  }

  bookTitleLink(index: number): Locator {
    return this.bookItems.nth(index).locator('h3 a');
  }

  bookPrice(index: number): Locator {
    return this.bookItems.nth(index).locator('.price_color');
  }

  bookRating(index: number): Locator {
    return this.bookItems.nth(index).locator('p.star-rating');
  }

  bookAvailability(index: number): Locator {
    return this.bookItems.nth(index).locator('.instock.availability');
  }

  bookAddToBasket(index: number): Locator {
    return this.bookItems.nth(index).locator('button.btn-primary');
  }

  get resultsSummary(): Locator {
    return this.page.locator('form.form-horizontal');
  }

  categoryLink(name: string): Locator {
    return this.sidebarLinks.filter({ hasText: name });
  }

  async getAllBookPrices(): Promise<string[]> {
    return this.bookItems.locator('.price_color').allInnerTexts();
  }
}

test.use({ baseURL: TEST_DATA.baseUrl, viewport: { width: 1280, height: 800 } });

test.describe('Books to Scrape - Browse all books on the homepage', () => {
  let homePage: BooksHomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new BooksHomePage(page);
    await homePage.goto();
  });

  // TC-001-P :: homepage loads with correct title, header and logo [FR-01]
  test('TC-001-P :: homepage displays correct title, heading and logo', async ({ page }) => {
    await expect(page).toHaveTitle(TEST_DATA.pageTitle);
    await expect(homePage.heading).toBeVisible();
    await expect(homePage.heading).toContainText(TEST_DATA.mainHeading);
    await expect(homePage.logo).toContainText(TEST_DATA.logoText);
  });

  // TC-002-P :: homepage displays exactly 20 book cards [FR-02]
  test('TC-002-P :: homepage displays exactly 20 book cards', async () => {
    await expect(homePage.bookItems).toHaveCount(TEST_DATA.booksPerPage);
  });

  // TC-003-P :: first book card shows title, price, rating and stock status [FR-03]
  test('TC-003-P :: first book card displays title, price, rating and stock status', async () => {
    await expect(homePage.bookTitleLink(0)).toHaveAttribute('title', TEST_DATA.firstBookTitle);
    await expect(homePage.bookPrice(0)).toHaveText(TEST_DATA.firstBookPrice);
    await expect(homePage.bookRating(0)).toBeVisible();
    await expect(homePage.bookAvailability(0)).toContainText(TEST_DATA.firstBookStock);
  });

  // TC-004-P :: result summary reports the full catalogue size of 1000 books [FR-04]
  test('TC-004-P :: homepage reports 1000 total results', async () => {
    await expect(homePage.resultsSummary).toContainText(TEST_DATA.totalResultsText);
  });

  // TC-005-P :: clicking next pagination link navigates to page 2 with 20 books [FR-05]
  test('TC-005-P :: clicking "next" navigates to page 2 with 20 books', async ({ page }) => {
    await expect(homePage.nextPageLink).toBeEnabled();
    await homePage.nextPageLink.click();
    await expect(page).toHaveURL(/catalogue\/page-2\.html/);
    await expect(homePage.bookItems).toHaveCount(TEST_DATA.booksPerPage);
  });

  // TC-006-P :: sidebar category link navigates to a filtered category page [FR-06]
  test('TC-006-P :: sidebar category link navigates to filtered category page', async ({ page }) => {
    const travelLink = homePage.categoryLink(TEST_DATA.sampleCategory);
    await expect(travelLink).toBeVisible();
    await travelLink.click();
    await expect(page).toHaveURL(/catalogue\/category\/books\/travel_2/);
    await expect(homePage.heading).toContainText(TEST_DATA.sampleCategory);
  });

  // TC-007-F :: last catalogue page (50) has no "next" pagination link [FR-05]
  test('TC-007-F :: last page of pagination has no "next" link', async () => {
    await homePage.gotoUrl(TEST_DATA.page50Url);
    await expect(homePage.bookItems).toHaveCount(TEST_DATA.booksPerPage);
    await expect(homePage.nextPageLink).toHaveCount(0);
  });

  // TC-008-F :: requesting a catalogue page beyond the last page returns a 404 [FR-05]
  test('TC-008-F :: navigating past the last catalogue page returns 404', async () => {
    const response = await homePage.gotoUrl(TEST_DATA.invalidPageUrl);
    expect(response?.status()).toBe(404);
  });

  // TC-009-F :: no book card on the homepage has a missing or malformed price [FR-03]
  test('TC-009-F :: no book on the homepage has a malformed or zero price', async () => {
    const prices = await homePage.getAllBookPrices();
    expect(prices.length).toBe(TEST_DATA.booksPerPage);
    for (const price of prices) {
      expect(price.trim()).toMatch(TEST_DATA.pricePattern);
      expect(parseFloat(price.replace('£', ''))).toBeGreaterThan(0);
    }
  });
});
