/**
 * Feature: httpbookstoscrapecom-browse-all-books-on
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  page2Url: '/catalogue/page-2.html',
  page50Url: '/catalogue/page-50.html',
  page51Url: '/catalogue/page-51.html',
  invalidPath: '/nonexistent-page',
  expectedBookCount: 20,
  priceRegex: /^£\d+\.\d{2}$/,
  validRatings: ['One', 'Two', 'Three', 'Four', 'Five'],
  invalidRatings: ['Zero', 'Six'],
  siteName: 'Books to Scrape',
};

class BookListPage {
  constructor(private page: Page) {}

  async navigate() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async navigateTo(path: string) {
    return this.page.goto(path);
  }

  bookItems() {
    return this.page.locator('article.product_pod');
  }

  bookImages() {
    return this.page.locator('article.product_pod img');
  }

  bookTitleLinks() {
    return this.page.locator('article.product_pod h3 > a');
  }

  bookPrices() {
    return this.page.locator('article.product_pod .price_color');
  }

  bookAvailability() {
    return this.page.locator('article.product_pod .availability');
  }

  bookRatings() {
    return this.page.locator('article.product_pod p.star-rating');
  }

  nextLink() {
    return this.page.locator('li.next > a');
  }

  previousListItem() {
    return this.page.locator('li.previous');
  }

  previousLink() {
    return this.page.locator('li.previous > a');
  }

  header() {
    return this.page.locator('header');
  }

  async clickFirstBookTitle() {
    await this.bookTitleLinks().first().click();
  }

  async clickNextLink() {
    await this.nextLink().click();
  }
}

test.describe('httpbookstoscrapecom-browse-all-books-on', () => {
  let bookListPage: BookListPage;

  test.beforeEach(async ({ page }) => {
    bookListPage = new BookListPage(page);
  });

  // TC-001-P :: Homepage loads with visible book catalogue
  test('should load homepage with HTTP 200 and at least one visible book item', async ({ page }) => {
    const response = await bookListPage.navigate();
    expect(response?.status()).toBe(200);
    await expect(bookListPage.bookItems().first()).toBeVisible();
  });

  // TC-001-F :: Invalid path returns no catalogue (404)  [FR-01]
  test('should return 404 and render no book items for an invalid path', async ({ page }) => {
    const response = await bookListPage.navigateTo(TEST_DATA.invalidPath);
    expect(response?.status()).toBe(404);
    await expect(bookListPage.bookItems()).toHaveCount(0);
  });

  // TC-002-P :: Exactly 20 books displayed on page 1  [FR-02]
  test('should display exactly 20 book items on page 1', async ({ page }) => {
    await bookListPage.navigate();
    await expect(bookListPage.bookItems()).toHaveCount(TEST_DATA.expectedBookCount);
  });

  // TC-002-F :: Book count is not 19 or 21 (boundary)  [FR-02]
  test('should not display 19 or 21 book items on page 1', async ({ page }) => {
    await bookListPage.navigate();
    const count = await bookListPage.bookItems().count();
    expect(count).not.toBe(19);
    expect(count).not.toBe(21);
    expect(count).toBe(TEST_DATA.expectedBookCount);
  });

  // TC-003-P :: Every book has a cover image with non-empty src  [FR-03]
  test('should show a non-empty cover image src for every book', async ({ page }) => {
    await bookListPage.navigate();
    const images = bookListPage.bookImages();
    const count = await images.count();
    expect(count).toBe(TEST_DATA.expectedBookCount);
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  // TC-003-F :: No book is missing a title link  [FR-03]
  test('should not have any book with an empty title attribute', async ({ page }) => {
    await bookListPage.navigate();
    const titles = bookListPage.bookTitleLinks();
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const title = await titles.nth(i).getAttribute('title');
      expect(title?.trim()).not.toBe('');
    }
  });

  // TC-004-P :: Every book shows a valid GBP price  [FR-04]
  test('should show a valid GBP-formatted price for every book', async ({ page }) => {
    await bookListPage.navigate();
    const prices = bookListPage.bookPrices();
    const count = await prices.count();
    expect(count).toBe(TEST_DATA.expectedBookCount);
    for (let i = 0; i < count; i++) {
      const text = await prices.nth(i).textContent();
      expect(text?.trim()).toMatch(TEST_DATA.priceRegex);
    }
  });

  // TC-004-F :: No book is missing a price element  [FR-04]
  test('should not have any book missing a visible price element', async ({ page }) => {
    await bookListPage.navigate();
    const items = bookListPage.bookItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i).locator('.price_color')).toBeVisible();
    }
  });

  // TC-005-P :: Every book shows an availability label  [FR-05]
  test('should show a non-empty availability label for every book', async ({ page }) => {
    await bookListPage.navigate();
    const availability = bookListPage.bookAvailability();
    const count = await availability.count();
    expect(count).toBe(TEST_DATA.expectedBookCount);
    for (let i = 0; i < count; i++) {
      const text = await availability.nth(i).textContent();
      expect(text?.trim()).not.toBe('');
    }
  });

  // TC-005-F :: No book is missing an availability element  [FR-05]
  test('should not have any book missing the availability element', async ({ page }) => {
    await bookListPage.navigate();
    const items = bookListPage.bookItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i).locator('.availability')).toHaveCount(1);
    }
  });

  // TC-006-P :: Every book has a machine-readable star rating  [FR-06]
  test('should show a valid star-rating class for every book', async ({ page }) => {
    await bookListPage.navigate();
    const ratings = bookListPage.bookRatings();
    const count = await ratings.count();
    expect(count).toBe(TEST_DATA.expectedBookCount);
    for (let i = 0; i < count; i++) {
      const classAttr = (await ratings.nth(i).getAttribute('class')) ?? '';
      const tokens = classAttr.split(' ');
      const hasValidRating = TEST_DATA.validRatings.some((rating) => tokens.includes(rating));
      expect(hasValidRating).toBe(true);
    }
  });

  // TC-006-F :: Rating class is not an unrecognised value  [FR-06]
  test('should not contain an invalid rating token on the first book', async ({ page }) => {
    await bookListPage.navigate();
    const classAttr = (await bookListPage.bookRatings().first().getAttribute('class')) ?? '';
    const tokens = classAttr.split(' ');
    for (const invalid of TEST_DATA.invalidRatings) {
      expect(tokens).not.toContain(invalid);
    }
  });

  // TC-007-P :: "Next" pagination link is visible on page 1  [FR-07]
  test('should show a visible next link with a valid href on page 1', async ({ page }) => {
    await bookListPage.navigate();
    await expect(bookListPage.nextLink()).toBeVisible();
    const href = await bookListPage.nextLink().getAttribute('href');
    expect(href).toBeTruthy();
  });

  // TC-007-F :: No "previous" link present on page 1  [FR-07]
  test('should not show a previous link on page 1', async ({ page }) => {
    await bookListPage.navigate();
    await expect(bookListPage.previousListItem()).toHaveCount(0);
  });

  // TC-008-P :: Clicking "next" navigates to page 2 with new books  [FR-07]
  test('should navigate to page 2 with a distinct set of books when next is clicked', async ({ page }) => {
    await bookListPage.navigate();
    const page1Titles = await bookListPage.bookTitleLinks().evaluateAll((els) =>
      els.map((el) => el.getAttribute('title'))
    );
    await bookListPage.clickNextLink();
    await expect(page).toHaveURL(/page-2/);
    const page2Titles = await bookListPage.bookTitleLinks().evaluateAll((els) =>
      els.map((el) => el.getAttribute('title'))
    );
    const overlap = page2Titles.filter((title) => page1Titles.includes(title));
    expect(overlap).toHaveLength(0);
  });

  // TC-008-F :: "Next" link absent on last page (page 50)  [FR-07]
  test('should not show a next link on page 50 but should show a previous link', async ({ page }) => {
    await bookListPage.navigateTo(TEST_DATA.page50Url);
    await expect(page.locator('li.next')).toHaveCount(0);
    await expect(bookListPage.previousLink()).toBeVisible();
  });

  // TC-009-P :: Clicking a book title navigates to its detail page  [FR-08]
  test('should navigate to a catalogue detail page when a book title is clicked', async ({ page }) => {
    await bookListPage.navigate();
    await bookListPage.clickFirstBookTitle();
    await expect(page).toHaveURL(/\/catalogue\//);
  });

  // TC-009-F :: Page beyond last page returns 404, not an empty catalogue  [FR-08]
  test('should return 404 for a page number beyond the last valid page', async ({ page }) => {
    const response = await bookListPage.navigateTo(TEST_DATA.page51Url);
    expect(response?.status()).toBe(404);
    await expect(bookListPage.bookItems()).toHaveCount(0);
  });

  // TC-010-P :: Page title contains "Books"  [FR-09]
  test('should have a page title containing "Books"', async ({ page }) => {
    await bookListPage.navigate();
    await expect(page).toHaveTitle(/Books/i);
  });

  // TC-010-F :: Site header is not missing or empty  [FR-09]
  test('should show a visible header containing the site name', async ({ page }) => {
    await bookListPage.navigate();
    await expect(bookListPage.header()).toBeVisible();
    await expect(bookListPage.header()).toContainText(TEST_DATA.siteName);
  });
});
