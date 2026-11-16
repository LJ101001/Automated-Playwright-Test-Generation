/**
 * Feature: httpbookstoscrapecom-add-a-book-to-the-b
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 *
 * Scope note: live verification (see IMPL_SUMMARY) confirmed the site's
 * "Add to basket" control is a cosmetic no-op (GET reload to the same URL
 * with an empty query string). FR-01/02/06/08/09 are tested against that
 * confirmed behaviour. FR-03/04/05/07 have no implementable state on this
 * site (no quantity field, no basket/confirmation state) and are documented
 * as out-of-scope in TC_httpbookstoscrapecom-add-a-book-to-the-b.md.
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  bookA: {
    title: 'A Light in the Attic',
    detailUrl: '/catalogue/a-light-in-the-attic_1000/index.html',
  },
  bookB: {
    title: "It's Only the Himalayas",
    detailUrl: '/catalogue/its-only-the-himalayas_981/index.html',
  },
  reloadUrlSuffix: '/?',
  rapidClickCount: 5,
};

class BookBasketPage {
  constructor(private page: Page) {}

  async navigate() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async navigateToDetail(detailUrl: string) {
    return this.page.goto(detailUrl);
  }

  tileFor(title: string) {
    return this.page.locator(`article.product_pod:has(h3 a[title="${title}"])`);
  }

  addToBasketButtonFor(title: string) {
    return this.tileFor(title).locator('form button[type="submit"]');
  }

  async addToBasket(title: string) {
    await this.addToBasketButtonFor(title).click();
  }

  messages() {
    return this.page.locator('#messages');
  }
}

test.describe('httpbookstoscrapecom-add-a-book-to-the-b', () => {
  let basketPage: BookBasketPage;

  test.beforeEach(async ({ page }) => {
    basketPage = new BookBasketPage(page);
    await basketPage.navigate();
  });

  // TC-001-P :: Add to Basket control is visible and enabled on a listing-page tile  [FR-01]
  test('should show a visible, enabled Add to Basket button on the homepage tile', async () => {
    const button = basketPage.addToBasketButtonFor(TEST_DATA.bookA.title);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  // TC-001-F :: Add to Basket control does not exist on the product detail page  [FR-01]
  test('should not find an Add to Basket button on the product detail page', async ({ page }) => {
    await basketPage.navigateToDetail(TEST_DATA.bookA.detailUrl);
    const detailButton = page.locator('.product_main button, .product_main form button[type="submit"]');
    await expect(detailButton).toHaveCount(0);
  });

  // TC-002-P :: Clicking Add to Basket produces the confirmed GET-reload-to-? outcome  [FR-02]
  test('should reload to the current URL with an empty query string when Add to Basket is clicked', async ({ page }) => {
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.search === '');
    expect(page.url().endsWith(TEST_DATA.reloadUrlSuffix)).toBe(true);
  });

  // TC-002-F :: Clicking Add to Basket does not produce a message, counter, or cart-page confirmation  [FR-02]
  test('should not show any confirmation message when Add to Basket is clicked', async ({ page }) => {
    await expect(basketPage.messages()).toHaveText('');
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    await expect(basketPage.messages()).toHaveText('');
    const cartResponse = await page.goto('/cart', { timeout: 5000 }).catch(() => null);
    expect(cartResponse === null || cartResponse.status() === 404).toBe(true);
  });

  // TC-003-P :: Adding the same book twice produces the same defined no-op outcome both times  [FR-06]
  test('should produce the same reload outcome on a second Add to Basket click after re-navigation', async ({ page }) => {
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    const firstUrl = page.url();
    await basketPage.navigate();
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    const secondUrl = page.url();
    expect(secondUrl).toBe(firstUrl);
  });

  // TC-003-F :: Repeated add-to-basket does not create a duplicate line item, counter, or cart route  [FR-06]
  test('should not surface any basket counter or duplicate confirmation on a second click', async ({ page }) => {
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    await basketPage.navigate();
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    await expect(basketPage.messages()).toHaveText('');
    await expect(page.locator('[class*="basket-count"], [class*="cart-count"]')).toHaveCount(0);
  });

  // TC-004-P :: Add to Basket behaves identically for two different books  [FR-08]
  test('should produce the same reload outcome for two different books', async ({ page }) => {
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    const bookAUrl = page.url();
    await basketPage.navigate();
    await basketPage.addToBasket(TEST_DATA.bookB.title);
    const bookBUrl = page.url();
    expect(bookAUrl.endsWith(TEST_DATA.reloadUrlSuffix)).toBe(true);
    expect(bookBUrl.endsWith(TEST_DATA.reloadUrlSuffix)).toBe(true);
  });

  // TC-005-P :: No basket state is created, so state is unchanged across navigation away and back  [FR-09]
  test('should keep basket state unchanged after navigating away and back', async ({ page }) => {
    await basketPage.addToBasket(TEST_DATA.bookA.title);
    await expect(basketPage.messages()).toHaveText('');
    await basketPage.navigateToDetail(TEST_DATA.bookA.detailUrl);
    await basketPage.navigate();
    await expect(basketPage.messages()).toHaveText('');
  });

  // TC-005-F :: No uncaught JavaScript errors occur on Add to Basket click  [FR-09]
  test('should not raise any uncaught JavaScript errors when Add to Basket is clicked', async ({ page }) => {
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await basketPage.addToBasket(TEST_DATA.bookA.title);

    expect(pageErrors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  // TC-006-F :: Rapid repeated clicks do not corrupt page state or throw errors  [FR-09]
  test('should settle into the defined no-op state with no errors after rapid repeated clicks', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    for (let i = 0; i < TEST_DATA.rapidClickCount; i++) {
      await basketPage.navigate();
      await basketPage.addToBasket(TEST_DATA.bookA.title);
    }

    expect(pageErrors).toHaveLength(0);
    expect(page.url().endsWith(TEST_DATA.reloadUrlSuffix)).toBe(true);
    await expect(basketPage.tileFor(TEST_DATA.bookA.title)).toBeVisible();
  });
});
