/**
 * Feature: baseline-httpbookstoscrapecom-add-a-book-to-the-b
 * Agent: Single-Agent Baseline
 * Dissertation: Lewis Watson, 40619754
 * Condition: single-agent (no role decomposition)
 *
 * Live-site discovery note: the product detail page
 * (.product_main) at books.toscrape.com contains no <button> or
 * <form> element of any kind — there is no native "add to basket"
 * control on the product page itself. The only functional
 * "Add to basket" control on the site lives on the catalogue
 * listing tile (article.product_pod), as a bare <form> with no
 * action/method attribute, which submits as a GET to the current
 * URL and appends an empty "?" query string (a cosmetic no-op:
 * no confirmation message, counter, or basket page ever appears).
 * FR-02 and FR-05 test this confirmed absence/no-op behaviour
 * directly rather than assuming a full basket workflow exists.
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  bookA: {
    title: 'A Light in the Attic',
    detailUrl: '/catalogue/a-light-in-the-attic_1000/index.html',
  },
  bookB: {
    title: 'Soumission',
    detailUrl: '/catalogue/soumission_998/index.html',
  },
  expectedPrice: '£51.77',
  expectedStockSubstring: 'In stock',
  reloadUrlSuffix: '/?',
  rapidClickCount: 5,
};

class ProductPage {
  constructor(private page: Page) {}

  async goHome() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async goToDetail(detailUrl: string) {
    return this.page.goto(detailUrl);
  }

  heading() {
    return this.page.locator('.product_main h1');
  }

  price() {
    return this.page.locator('.product_main p.price_color');
  }

  stockStatus() {
    return this.page.locator('.product_main p.instock.availability');
  }

  detailPageButtons() {
    return this.page.locator('.product_main button');
  }

  detailPageForms() {
    return this.page.locator('.product_main form');
  }

  listingTileFor(title: string) {
    return this.page.locator(`article.product_pod:has(h3 a[title="${title}"])`);
  }

  listingAddToBasketButtonFor(title: string) {
    return this.listingTileFor(title).locator('form button[type="submit"]');
  }

  async addToBasketFromListing(title: string) {
    await this.listingAddToBasketButtonFor(title).click();
  }

  messages() {
    return this.page.locator('#messages');
  }
}

test.describe('add a book to the basket from the product page', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
  });

  // TC-001-P :: product page renders the book's title, price, and stock status [FR-01]
  test('should display the book title, price, and stock status on the product page', async () => {
    await productPage.goToDetail(TEST_DATA.bookA.detailUrl);
    await expect(productPage.heading()).toContainText(TEST_DATA.bookA.title);
    await expect(productPage.price()).toContainText(TEST_DATA.expectedPrice);
    await expect(productPage.stockStatus()).toContainText(TEST_DATA.expectedStockSubstring);
  });

  // TC-002-P :: the site's functional Add to Basket control is visible and enabled from the listing tile [FR-02]
  test('should show a visible, enabled Add to Basket control reachable for the product', async () => {
    await productPage.goHome();
    const button = productPage.listingAddToBasketButtonFor(TEST_DATA.bookA.title);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(button).toContainText('Add to basket');
  });

  // TC-003-P :: clicking Add to Basket completes without error and keeps the page usable [FR-05]
  test('should keep the page rendered and interactive after Add to Basket is clicked', async ({ page }) => {
    await productPage.goHome();
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await productPage.addToBasketFromListing(TEST_DATA.bookA.title);

    expect(pageErrors).toHaveLength(0);
    await expect(page.locator('body')).toBeVisible();
    await expect(productPage.listingTileFor(TEST_DATA.bookA.title)).toBeVisible();
  });

  // TC-004-F :: the product page itself exposes no add-to-basket button or form [FR-03]
  test('should not find any button on the product detail page', async () => {
    await productPage.goToDetail(TEST_DATA.bookA.detailUrl);
    await expect(productPage.detailPageButtons()).toHaveCount(0);
    await expect(productPage.detailPageForms()).toHaveCount(0);
  });

  // TC-005-F :: clicking Add to Basket produces no confirmation message anywhere on the site [FR-04]
  test('should not show a confirmation message after Add to Basket is clicked', async ({ page }) => {
    await productPage.goHome();
    await expect(productPage.messages()).toHaveText('');
    await productPage.addToBasketFromListing(TEST_DATA.bookA.title);
    await expect(productPage.messages()).toHaveText('');
    await expect(page.locator('[class*="basket-count"], [class*="cart-count"]')).toHaveCount(0);
  });

  // TC-006-F :: rapid repeated Add to Basket clicks do not throw errors or change the outcome [FR-05]
  test('should settle into the same no-op outcome with no errors after rapid repeated clicks', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    for (let i = 0; i < TEST_DATA.rapidClickCount; i++) {
      await productPage.goHome();
      await productPage.addToBasketFromListing(TEST_DATA.bookA.title);
    }

    expect(pageErrors).toHaveLength(0);
    expect(page.url().endsWith(TEST_DATA.reloadUrlSuffix)).toBe(true);
  });

  // TC-007-P :: navigating from the product page to the listing and adding to basket reaches the confirmed reload state [FR-02]
  test('should reach the confirmed reload URL after viewing the product page then adding via the listing', async ({ page }) => {
    await productPage.goToDetail(TEST_DATA.bookA.detailUrl);
    await productPage.goHome();
    await productPage.addToBasketFromListing(TEST_DATA.bookA.title);
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.search === '');
    expect(page.url().endsWith(TEST_DATA.reloadUrlSuffix)).toBe(true);
  });

  // TC-008-F :: Add to Basket produces the identical no-op outcome for a second, different book [FR-03]
  test('should not expose a product-page add-to-basket control for a second book either', async () => {
    await productPage.goToDetail(TEST_DATA.bookB.detailUrl);
    await expect(productPage.heading()).toContainText(TEST_DATA.bookB.title);
    await expect(productPage.detailPageButtons()).toHaveCount(0);
  });
});
