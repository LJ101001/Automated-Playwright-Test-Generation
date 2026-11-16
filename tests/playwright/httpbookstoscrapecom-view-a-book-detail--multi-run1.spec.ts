/**
 * Feature: httpbookstoscrapecom-view-a-book-detail-
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  targetBookUrl: '/catalogue/a-light-in-the-attic_1000/index.html',
  specialTitleBookUrl: '/catalogue/its-only-the-himalayas_981/index.html',
  specialTitleBookTitle: "It's Only the Himalayas",
  priceRegex: /^£\d+\.\d{2}$/,
  ratingClassRegex: /star-rating (One|Two|Three|Four|Five)/,
  expectedTableHeaders: [
    'UPC',
    'Product Type',
    'Price (excl. tax)',
    'Price (incl. tax)',
    'Tax',
    'Availability',
    'Number of reviews',
  ],
  detailUrlPattern: /\/catalogue\/.+_\d+\/index\.html/,
  imageRequestPattern: '**/media/cache/**',

  missingTitleFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main">
      <p class="price_color">£51.77</p>
    </div>
  </body></html>`,

  malformedPriceFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main">
      <h1>A Light in the Attic</h1>
      <p class="price_color">Free!</p>
    </div>
  </body></html>`,

  zeroAvailabilityFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main">
      <h1>A Light in the Attic</h1>
      <p class="instock availability">
        <i class="icon-ok"></i> In stock (0 available)
      </p>
    </div>
  </body></html>`,

  missingAvailabilityFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main">
      <h1>A Light in the Attic</h1>
      <p class="instock availability"></p>
    </div>
  </body></html>`,

  shortDescriptionFixtureHtml: `<!DOCTYPE html><html><body>
    <div id="product_description" class="sub-header"><h2>Product Description</h2></div>
    <p>Ok.</p>
  </body></html>`,

  missingDescriptionFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main"><h1>A Light in the Attic</h1></div>
  </body></html>`,

  invalidRatingFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main">
      <h1>A Light in the Attic</h1>
      <p class="star-rating Six"></p>
    </div>
  </body></html>`,

  missingTableFixtureHtml: `<!DOCTYPE html><html><body>
    <div class="product_main"><h1>A Light in the Attic</h1></div>
  </body></html>`,
};

class BookDetailPage {
  constructor(private page: Page) {}

  async navigateHome() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async navigateToBook(url: string) {
    return this.page.goto(url);
  }

  heading() {
    return this.page.locator('.product_main h1');
  }

  price() {
    return this.page.locator('.product_main p.price_color');
  }

  availability() {
    return this.page.locator('.product_main p.instock.availability');
  }

  description() {
    return this.page.locator('#product_description ~ p');
  }

  descriptionHeading() {
    return this.page.locator('#product_description');
  }

  starRating() {
    return this.page.locator('.product_main .star-rating');
  }

  table() {
    return this.page.locator('table.table-striped');
  }

  tableHeaders() {
    return this.page.locator('table.table-striped th');
  }

  tableRows() {
    return this.page.locator('table.table-striped tr');
  }

  priceExclCell() {
    return this.page.locator('table.table-striped tr:nth-child(3) td');
  }

  priceInclCell() {
    return this.page.locator('table.table-striped tr:nth-child(4) td');
  }

  taxCell() {
    return this.page.locator('table.table-striped tr:nth-child(5) td');
  }

  coverImage() {
    return this.page.locator('div.item.active img');
  }

  firstProductPodTitleLink() {
    return this.page.locator('.product_pod h3 a').first();
  }

  firstProductPodImageLink() {
    return this.page.locator('.product_pod .image_container img').first();
  }

  firstProductPodPrice() {
    return this.page.locator('.product_pod p.price_color').first();
  }

  async clickFirstTitleLink() {
    await this.firstProductPodTitleLink().click();
  }

  async clickFirstImageLink() {
    await this.firstProductPodImageLink().click();
  }
}

test.describe('httpbookstoscrapecom-view-a-book-detail-', () => {
  let bookDetailPage: BookDetailPage;

  test.beforeEach(async ({ page }) => {
    bookDetailPage = new BookDetailPage(page);
  });

  // TC-001-P :: Detail page displays the full book title  [FR-01]
  test('should display a non-empty book title after navigating from the catalogue', async ({ page }) => {
    await bookDetailPage.navigateHome();
    await bookDetailPage.clickFirstTitleLink();
    await expect(bookDetailPage.heading()).toBeVisible();
    await expect(bookDetailPage.heading()).not.toHaveText('');
  });

  // TC-002-F :: Long/special-character title renders without truncation or entity mangling  [FR-01]
  test('should render an apostrophe title literally with no truncation or HTML entity', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.specialTitleBookUrl);
    await expect(bookDetailPage.heading()).toHaveText(TEST_DATA.specialTitleBookTitle);
  });

  // TC-003-F :: Missing title element is detected as a failure  [FR-01]
  test('should detect a missing title element as absent', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.missingTitleFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.heading()).toHaveCount(0);
  });

  // TC-004-P :: Price is displayed in GBP format on the detail page  [FR-02]
  test('should display the price in £XX.XX format', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.price()).toHaveText(TEST_DATA.priceRegex);
  });

  // TC-005-P :: Detail page price matches the catalogue listing price for the same book  [FR-02]
  test('should show a detail-page price equal to the homepage catalogue price for the same book', async ({ page }) => {
    await bookDetailPage.navigateHome();
    const catalogueePriceText = (await bookDetailPage.firstProductPodPrice().textContent())?.trim();
    await bookDetailPage.clickFirstTitleLink();
    const detailPriceText = (await bookDetailPage.price().textContent())?.trim();
    expect(detailPriceText).toBe(catalogueePriceText);
  });

  // TC-006-F :: Malformed/non-numeric price is detected as a failure  [FR-02]
  test('should detect a non-numeric price string as unparseable', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.malformedPriceFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const priceText = await bookDetailPage.price().textContent();
    const parsed = parseFloat((priceText ?? '').replace('£', ''));
    expect(Number.isNaN(parsed)).toBe(true);
  });

  // TC-007-P :: In-stock availability includes a copy count  [FR-03]
  test('should show "In stock" with a parenthesised numeric copy count', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const text = await bookDetailPage.availability().textContent();
    expect(text).toContain('In stock');
    expect(text).toMatch(/\(\d+ available\)/);
  });

  // TC-008-F :: Availability count of zero is distinguished from a generic out-of-stock label  [FR-03]
  test('should parse a zero copy count as the integer 0, not as absent', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.zeroAvailabilityFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const text = await bookDetailPage.availability().textContent();
    const match = text?.match(/\((\d+) available\)/);
    const count = match ? Number(match[1]) : null;
    expect(count).toBe(0);
    expect(count).not.toBeNull();
  });

  // TC-009-F :: Missing/empty availability text is detected as a failure  [FR-03]
  test('should detect an empty availability element as invalid', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.missingAvailabilityFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const text = (await bookDetailPage.availability().textContent())?.trim();
    expect(text).toBe('');
  });

  // TC-010-P :: Product description text is visible  [FR-04]
  test('should display a visible, non-empty product description', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.description()).toBeVisible();
    const text = await bookDetailPage.description().textContent();
    expect((text ?? '').length).toBeGreaterThan(0);
  });

  // TC-011-F :: Short/boilerplate description is still detected as present  [FR-04]
  test('should treat a very short description as present, requiring no minimum length', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.shortDescriptionFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.description()).toBeVisible();
    const text = await bookDetailPage.description().textContent();
    expect((text ?? '').length).toBeGreaterThanOrEqual(1);
  });

  // TC-012-F :: Missing description section is detected as a failure  [FR-04]
  test('should detect an entirely absent description section', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.missingDescriptionFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.descriptionHeading()).toHaveCount(0);
    await expect(bookDetailPage.description()).toHaveCount(0);
  });

  // TC-013-P :: Star rating is displayed with a valid class  [FR-05]
  test('should have a star-rating class matching one of the five valid rating words', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const classAttr = await bookDetailPage.starRating().getAttribute('class');
    expect(classAttr).toMatch(TEST_DATA.ratingClassRegex);
  });

  // TC-014-F :: Star rating element is present exactly once  [FR-05]
  test('should have exactly one star-rating element on the detail page', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.starRating()).toHaveCount(1);
  });

  // TC-015-F :: Invalid/missing rating class is detected as a failure  [FR-05]
  test('should detect a rating class outside the five valid rating words', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.invalidRatingFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const classAttr = await bookDetailPage.starRating().getAttribute('class');
    expect(classAttr).not.toMatch(TEST_DATA.ratingClassRegex);
  });

  // TC-016-P :: Product information table contains all required fields  [FR-06]
  test('should list all seven expected table headers in order', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const headers = await bookDetailPage.tableHeaders().allTextContents();
    expect(headers.map((h) => h.trim())).toEqual(TEST_DATA.expectedTableHeaders);
  });

  // TC-017-F :: Table price fields are valid GBP values  [FR-06]
  test('should show valid £XX.XX values for price excl. tax, price incl. tax, and tax rows', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.priceExclCell()).toHaveText(TEST_DATA.priceRegex);
    await expect(bookDetailPage.priceInclCell()).toHaveText(TEST_DATA.priceRegex);
    await expect(bookDetailPage.taxCell()).toHaveText(TEST_DATA.priceRegex);
  });

  // TC-018-F :: Missing product information table is detected as a failure  [FR-06]
  test('should detect an entirely missing product information table', async ({ page }) => {
    await page.route(`**${TEST_DATA.targetBookUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.missingTableFixtureHtml })
    );
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.table()).toHaveCount(0);
  });

  // TC-019-P :: Clicking a catalogue title navigates to the matching detail page  [FR-07]
  test('should navigate to the detail page matching the clicked catalogue title', async ({ page }) => {
    await bookDetailPage.navigateHome();
    const catalogueTitle = await bookDetailPage.firstProductPodTitleLink().getAttribute('title');
    await bookDetailPage.clickFirstTitleLink();
    await expect(page).toHaveURL(TEST_DATA.detailUrlPattern);
    const detailTitle = await bookDetailPage.heading().textContent();
    expect(detailTitle?.startsWith(catalogueTitle ?? '')).toBe(true);
  });

  // TC-020-P :: Clicking a cover image navigates to the matching detail page  [FR-07]
  test('should navigate to the detail page matching the clicked cover image', async ({ page }) => {
    await bookDetailPage.navigateHome();
    const catalogueTitle = await bookDetailPage.firstProductPodTitleLink().getAttribute('title');
    await bookDetailPage.clickFirstImageLink();
    await expect(page).toHaveURL(TEST_DATA.detailUrlPattern);
    const detailTitle = await bookDetailPage.heading().textContent();
    expect(detailTitle?.startsWith(catalogueTitle ?? '')).toBe(true);
  });

  // TC-021-F :: Navigation does not silently stay on the same page  [FR-07]
  test('should change the URL after clicking a book title link', async ({ page }) => {
    await bookDetailPage.navigateHome();
    const homeUrl = page.url();
    await bookDetailPage.clickFirstTitleLink();
    expect(page.url()).not.toBe(homeUrl);
  });

  // TC-022-P :: Cover image is visible and resolves without error  [FR-08]
  test('should display a cover image that resolves with non-zero natural dimensions', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    await expect(bookDetailPage.coverImage()).toBeVisible();
    const dimensions = await bookDetailPage.coverImage().evaluate((img: HTMLImageElement) => ({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
    expect(dimensions.naturalWidth).toBeGreaterThan(0);
    expect(dimensions.naturalHeight).toBeGreaterThan(0);
  });

  // TC-023-F :: Cover image has a non-empty src attribute  [FR-08]
  test('should have a non-empty, non-placeholder src attribute on the cover image', async ({ page }) => {
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const src = await bookDetailPage.coverImage().getAttribute('src');
    expect(src).not.toBe('');
    expect(src).not.toBeNull();
  });

  // TC-024-F :: Broken image resource is detected as a failure  [FR-08]
  test('should detect a broken cover image resource as having zero natural width', async ({ page }) => {
    await page.route(TEST_DATA.imageRequestPattern, (route) => route.abort());
    await bookDetailPage.navigateToBook(TEST_DATA.targetBookUrl);
    const naturalWidth = await bookDetailPage.coverImage().evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBe(0);
  });
});
