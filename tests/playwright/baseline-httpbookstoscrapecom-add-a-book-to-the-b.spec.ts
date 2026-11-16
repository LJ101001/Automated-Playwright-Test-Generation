/**
 * Feature: baseline-httpbookstoscrapecom-add-a-book-to-the-b
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 */
import { test, expect, Page, Locator } from '@playwright/test';

test.use({ baseURL: 'http://books.toscrape.com' });

const TEST_DATA = {
  homePath: '/index.html',
  productDetailPath: '/catalogue/a-light-in-the-attic_1000/index.html',
  productTitle: 'A Light in the Attic',
  productPrice: '£51.77',
  productAvailability: 'In stock (22 available)',
  nonExistentProductPath: '/catalogue/nonexistent-book_9999/index.html',
  addToBasketButtonText: 'Add to basket',
  expectedPodCount: 20,
};

class BooksToScrapePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoHome(): Promise<void> {
    await this.page.goto(TEST_DATA.homePath);
  }

  async gotoPath(path: string): Promise<void> {
    await this.page.goto(path);
  }

  get productPods(): Locator {
    return this.page.locator('.product_pod');
  }

  podByTitle(title: string): Locator {
    return this.productPods.filter({ has: this.page.locator(`h3 a[title="${title}"]`) });
  }

  addToBasketButton(pod: Locator): Locator {
    return pod.locator('button.btn-primary');
  }

  podPrice(pod: Locator): Locator {
    return pod.locator('p.price_color');
  }

  podAvailability(pod: Locator): Locator {
    return pod.locator('p.instock.availability');
  }

  get detailHeading(): Locator {
    return this.page.locator('.product_main h1');
  }

  get detailPrice(): Locator {
    return this.page.locator('.product_main p.price_color');
  }

  get detailAvailability(): Locator {
    return this.page.locator('.product_main p.instock.availability');
  }

  get detailAddToBasketButtons(): Locator {
    return this.page.locator('.product_main').locator('button:has-text("Add to basket")');
  }

  get basketIndicators(): Locator {
    return this.page.locator('header .basket, #basket, .basket-count, header a[href*="basket"]');
  }
}

test.describe('Add a book to the basket (books.toscrape.com)', () => {
  // TC-001-P :: "Add to basket" control is visible, enabled and correctly labelled on a listing card [FR-01]
  test('TC-001-P: add-to-basket button is visible and enabled for an in-stock book on the listing page', async ({ page }) => {
    const booksPage = new BooksToScrapePage(page);
    await booksPage.gotoHome();

    const pod = booksPage.podByTitle(TEST_DATA.productTitle);
    await expect(pod).toBeVisible();

    const button = booksPage.addToBasketButton(pod);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(button).toContainText(TEST_DATA.addToBasketButtonText);
  });

  // TC-002-P :: clicking "Add to basket" completes without error and keeps the user on-site [FR-02]
  test('TC-002-P: clicking add-to-basket submits without navigating to an error page', async ({ page }) => {
    const booksPage = new BooksToScrapePage(page);
    await booksPage.gotoHome();

    const pod = booksPage.podByTitle(TEST_DATA.productTitle);
    const button = booksPage.addToBasketButton(pod);

    await button.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/books\.toscrape\.com/);
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(booksPage.productPods).toHaveCount(TEST_DATA.expectedPodCount);
  });

  // TC-003-P :: listing card shows correct title, price and stock text alongside the basket control [FR-03]
  test('TC-003-P: listing card displays matching title, price and stock status', async ({ page }) => {
    const booksPage = new BooksToScrapePage(page);
    await booksPage.gotoHome();

    const pod = booksPage.podByTitle(TEST_DATA.productTitle);
    await expect(pod.locator('h3 a')).toHaveAttribute('title', TEST_DATA.productTitle);
    await expect(booksPage.podPrice(pod)).toContainText(TEST_DATA.productPrice);
    await expect(booksPage.podAvailability(pod)).toContainText('In stock');
  });

  // TC-004-F :: a non-existent product URL returns 404 and exposes no basket control [FR-04]
  test('TC-004-F: navigating to a non-existent product URL returns 404 without a basket control', async ({ page }) => {
    const booksPage = new BooksToScrapePage(page);
    const response = await page.goto(TEST_DATA.nonExistentProductPath);

    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText('404 Not Found');
    await expect(booksPage.detailAddToBasketButtons).toHaveCount(0);
  });

  // TC-005-F :: the book's own product detail page exposes no "Add to basket" control for itself [FR-05]
  test('TC-005-F: product detail page has no add-to-basket button for the viewed book', async ({ page }) => {
    const booksPage = new BooksToScrapePage(page);
    await booksPage.gotoPath(TEST_DATA.productDetailPath);

    await expect(booksPage.detailHeading).toHaveText(TEST_DATA.productTitle);
    await expect(booksPage.detailPrice).toContainText(TEST_DATA.productPrice);
    await expect(booksPage.detailAvailability).toContainText(TEST_DATA.productAvailability);
    await expect(booksPage.detailAddToBasketButtons).toHaveCount(0);
  });

  // TC-006-F :: clicking "Add to basket" produces no persisted basket indicator anywhere in the UI [FR-06]
  test('TC-006-F: no basket indicator appears anywhere after clicking add-to-basket', async ({ page }) => {
    const booksPage = new BooksToScrapePage(page);
    await booksPage.gotoHome();

    const pod = booksPage.podByTitle(TEST_DATA.productTitle);
    await booksPage.addToBasketButton(pod).click();
    await page.waitForLoadState('networkidle');

    await expect(booksPage.basketIndicators).toHaveCount(0);
  });
});
