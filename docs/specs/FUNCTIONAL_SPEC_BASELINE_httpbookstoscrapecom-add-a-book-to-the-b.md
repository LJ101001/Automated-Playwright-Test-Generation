# Functional Specification: httpbookstoscrapecom-add-a-book-to-the-b

## Source
Derived directly from requirement (no upstream USER_STORY file): "http://books.toscrape.com — add a book to the basket from the product page"

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Book catalogue demo site with a Django-Oscar-derived storefront UI (product listings, product detail pages, "Add to basket" controls); no authentication, no real payment/checkout

---

## Functional Requirements

### FR-01: Add to Basket Control Availability on Product Page
**Description**: The book's product detail page must present an "Add to basket" control in a visible, enabled state once the page has finished loading.
**Input**: Navigation to any book's product detail page (via catalogue link or direct URL).
**Expected Output / State Change**: The "Add to basket" control renders inside the product detail area, is visible without scrolling on a standard desktop viewport, and is not disabled.
**Validation Rules**: Control must exist in the DOM, must not carry a `disabled` attribute, and must be present before any click is attempted.

---

### FR-02: Add to Basket Action Produces a Confirmation
**Description**: Clicking "Add to basket" must add the book to the visitor's basket and surface an observable confirmation.
**Input**: A single click on the "Add to basket" control on a loaded product page.
**Expected Output / State Change**: A confirmation message/alert appears and/or the basket count indicator in the site header increments.
**Validation Rules**: Confirmation must appear within a bounded wait (≤ 2 seconds); it must not be visible before the click occurs.

---

### FR-03: Confirmation Reflects the Correct Book Title and Price
**Description**: The confirmation or basket entry produced by FR-02 must reference the exact book that was added, not a different or generic item.
**Input**: Add-to-basket action performed from a specific book's product page (title and price known ahead of the action).
**Expected Output / State Change**: The confirmation/basket entry displays the same title and price as shown on the source product page.
**Validation Rules**: Title and price string comparisons must be exact (trimmed of surrounding whitespace); the check depends on the FR-02 confirmation mechanism existing.

---

### FR-04: Default Added Quantity Is One
**Description**: Adding a book without changing any quantity control must reflect exactly one unit added.
**Input**: Add-to-basket action performed without interacting with the quantity field.
**Expected Output / State Change**: The basket/confirmation state shows quantity = 1 for that book.
**Validation Rules**: Quantity must never be 0 or blank following a default add.

---

### FR-05: Quantity Selector Accepts a Valid Whole Number Greater Than One
**Description**: If the product page exposes a quantity input, setting it to a whole number greater than 1 before clicking "Add to basket" must result in that exact quantity being added.
**Input**: A quantity value entered into the quantity control prior to clicking "Add to basket". Test values: 3 (valid), 1.5 (fractional), stock-boundary count.
**Expected Output / State Change**: For a valid whole number, the basket/confirmation reflects that exact quantity.
**Validation Rules**: Only positive whole numbers are accepted as entered; fractional values must be rejected or rounded, not silently truncated to an unrelated value.

---

### FR-06: Invalid Quantity Input Is Rejected or Normalised
**Description**: Quantity values of zero, negative numbers, non-numeric text, or an empty field must never be accepted as-is when adding to the basket.
**Input**: Quantity values `0`, `-1`, `"abc"`, `""` entered into the quantity field before clicking "Add to basket".
**Expected Output / State Change**: The control either blocks submission, clamps to a valid minimum (e.g. 1), or surfaces a validation error.
**Validation Rules**: No invalid quantity value may be silently accepted and added to the basket as entered.

---

### FR-07: Repeat Add-to-Basket Behaviour Is Deterministic
**Description**: Clicking "Add to basket" again for the same book — whether after a delay or as rapid repeated clicks — must produce one consistent, defined outcome rather than an error or corrupted state.
**Input**: Two or more click events on "Add to basket" for the same book: (a) with a delay between clicks, and (b) as 5 rapid/near-simultaneous clicks.
**Expected Output / State Change**: A single defined outcome each time (e.g. quantity increments, or a duplicate line item appears) with no unhandled exception or broken layout.
**Validation Rules**: The observed outcome must be identical every time the action is repeated under the same conditions.

---

### FR-08: Basket State Persists Across Navigation
**Description**: After adding a book, navigating away from the product page and back must not lose the basket entry or spuriously duplicate it.
**Input**: Add a book to the basket, navigate to another page (catalogue/home), then navigate back to the original product page or to the basket view.
**Expected Output / State Change**: The basket still contains exactly one entry for that book at the previously set quantity; no error occurs on return navigation.
**Validation Rules**: Basket item count must not increase merely from navigating away and back without an additional click.

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---------------|-------------|-------------------|
| `.product_main form button.btn.btn-primary.btn-block` (text: "Add to basket") | button (submit) | Primary add-to-basket control on the product detail page; triggers FR-02 |
| `.product_main h1` | heading | Displays book title; used for FR-03 comparison |
| `.product_main p.price_color` | text | Displays book price; used for FR-03 comparison |
| `#id_quantity` | input[number] | Quantity field on the product page, if present; governs FR-04/FR-05/FR-06 |
| `#messages .alert` | alert/banner | Confirmation message region; surfaces FR-02 outcome |
| `.basket-count` (site header) | badge | Numeric basket item counter; alternate confirmation surface for FR-02/FR-07/FR-08 |
| `a[href="/basket/"]` | link/page | Basket view listing added item(s); alternate confirmation surface |

*Selectors are the Business Analyst's best assumption based on standard Django-Oscar storefront conventions, inferred directly from the requirement text with no separate live-site verification pass in this baseline condition. Any selector or mechanism the live DOM does not actually support must be identified during test implementation rather than assumed.*

---

## Test Scenarios

### TS-01: Add to basket control is visible and enabled [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: A valid book product page URL is available.
- **Test Data**: First book on the catalogue homepage.
- **Steps**: 1) Navigate to the product page. 2) Wait for page load to complete. 3) Locate the "Add to basket" control.
- **Expected Result**: Control is present, visible, and not disabled.

### TS-02: Missing or disabled control is detected as a failure — Negative [FR-01]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Product page loaded.
- **Test Data**: N/A (assertion-based check).
- **Steps**: 1) Navigate to the product page. 2) Assert the control exists and has no `disabled` attribute.
- **Expected Result**: Test fails loudly if the control is absent or disabled, validating that the assertion itself catches this state.

### TS-03: Control is available immediately after load — Boundary [FR-01]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Product page navigation just initiated.
- **Test Data**: Any product page.
- **Steps**: 1) Navigate to the product page. 2) Check control state at `DOMContentLoaded` rather than full network idle.
- **Expected Result**: Control is already visible and enabled at the earlier load milestone, not only after full network idle.

### TS-04: Clicking Add to basket produces a confirmation [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: On a loaded product page.
- **Test Data**: Same product page as TS-01.
- **Steps**: 1) Click "Add to basket". 2) Observe the page for a confirmation message or basket count change.
- **Expected Result**: A confirmation message or incremented basket count appears within a bounded wait.

### TS-05: No confirmation is present before any click occurs — Negative [FR-02]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Product page freshly loaded, no click performed yet.
- **Test Data**: N/A
- **Steps**: 1) Navigate to the product page. 2) Assert no confirmation message is visible and basket count is at its pre-add baseline.
- **Expected Result**: Test fails if a confirmation or incremented count is present before any add action, catching false positives.

### TS-06: Confirmation appears within a strict time bound — Boundary [FR-02]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: On a loaded product page.
- **Test Data**: Single click.
- **Steps**: 1) Click "Add to basket". 2) Measure elapsed time until confirmation appears.
- **Expected Result**: Confirmation appears within 2 seconds of the click.

### TS-07: Confirmation shows the correct book title and price [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Confirmation mechanism from FR-02 is available.
- **Test Data**: Title and price captured from the product page before clicking.
- **Steps**: 1) Record product page title and price. 2) Click "Add to basket". 3) Read title/price shown in confirmation or basket.
- **Expected Result**: Title and price match exactly.

### TS-08: Confirmation never shows a mismatched book — Negative [FR-03]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: At least two distinct product pages available.
- **Test Data**: Book A and Book B titles/prices.
- **Steps**: 1) Add Book A to the basket. 2) Assert the confirmation/basket entry does not display Book B's title or price.
- **Expected Result**: No cross-contamination between the added book and any other book's data.

### TS-09: Long/special-character title renders correctly in confirmation — Boundary [FR-03]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: A book with a long title containing an apostrophe or ampersand exists (e.g. "It's Only the Himalayas").
- **Test Data**: Known full title string with special characters.
- **Steps**: 1) Add that book to the basket. 2) Read the title shown in the confirmation/basket entry.
- **Expected Result**: Title renders in full, with no truncation or mangled characters.

### TS-10: Default add reflects quantity of one [FR-04]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Quantity is observable in the confirmation/basket.
- **Test Data**: No quantity control interaction.
- **Steps**: 1) Click "Add to basket" without touching any quantity field. 2) Inspect resulting quantity.
- **Expected Result**: Quantity shown equals 1.

### TS-11: Default add never yields a zero or blank quantity — Negative [FR-04]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Default add performed per TS-10.
- **Test Data**: N/A
- **Steps**: 1) Perform a default add. 2) Assert quantity is neither 0 nor blank.
- **Expected Result**: Test fails if quantity is missing or zero after a default add.

### TS-12: Quantity boundary of exactly one via explicit input [FR-04]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: A quantity control exists on the product page.
- **Test Data**: Quantity = 1 (explicitly set).
- **Steps**: 1) Set quantity field to 1. 2) Click "Add to basket". 3) Inspect resulting quantity.
- **Expected Result**: Quantity shown equals 1, matching default behaviour (FR-04).

### TS-13: Setting a valid quantity greater than one [FR-05]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: A quantity selector exists on the product page.
- **Test Data**: Quantity = 3.
- **Steps**: 1) Set quantity field to 3. 2) Click "Add to basket". 3) Inspect resulting quantity.
- **Expected Result**: Quantity shown equals 3.

### TS-14: Fractional quantity is rejected or rounded — Negative [FR-05]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: A quantity selector exists on the product page.
- **Test Data**: Quantity = 1.5.
- **Steps**: 1) Set quantity field to 1.5. 2) Click "Add to basket". 3) Inspect resulting quantity.
- **Expected Result**: Resulting quantity is a whole number, never 1.5 as entered.

### TS-15: Quantity at maximum available stock — Boundary [FR-05]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: A book with a known in-stock copy count is available.
- **Test Data**: Quantity equal to the book's displayed stock count.
- **Steps**: 1) Set quantity field to the full in-stock count. 2) Click "Add to basket". 3) Inspect resulting quantity.
- **Expected Result**: The full valid quantity is accepted without error.

### TS-16: Zero quantity is rejected or normalised [FR-06]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: A quantity selector exists on the product page.
- **Test Data**: Quantity = 0.
- **Steps**: 1) Set quantity field to 0. 2) Click "Add to basket". 3) Observe resulting behaviour.
- **Expected Result**: Submission is blocked, clamped to a valid minimum, or a validation error is shown.

### TS-17: Negative quantity is rejected — Negative [FR-06]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: A quantity selector exists on the product page.
- **Test Data**: Quantity = -1.
- **Steps**: 1) Set quantity field to -1. 2) Click "Add to basket". 3) Observe resulting behaviour.
- **Expected Result**: System never adds a negative quantity as entered.

### TS-18: Non-numeric and empty quantity input is handled without a crash — Boundary [FR-06]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: A quantity selector exists on the product page.
- **Test Data**: Quantity values `"abc"` and `""`.
- **Steps**: 1) For each value, set the quantity field. 2) Click "Add to basket". 3) Observe resulting behaviour.
- **Expected Result**: No page crash or unhandled exception; value is rejected or normalised.

### TS-19: Adding the same book a second time (deliberate) [FR-07]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Book already added once per TS-04.
- **Test Data**: Same product page.
- **Steps**: 1) Click "Add to basket" again. 2) Observe outcome.
- **Expected Result**: A single defined outcome occurs (increment or duplicate line item) — no error.

### TS-20: Repeat click never throws an unhandled exception — Negative [FR-07]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: On a loaded product page with console/page-error monitoring attached.
- **Test Data**: Two clicks in sequence.
- **Steps**: 1) Attach console/page-error listener. 2) Click "Add to basket" twice. 3) Inspect captured errors.
- **Expected Result**: No uncaught JS exceptions or console errors are recorded.

### TS-21: Rapid repeated clicks do not corrupt basket state — Boundary [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: On a loaded product page.
- **Test Data**: 5 rapid clicks on "Add to basket" with no delay.
- **Steps**: 1) Programmatically fire 5 clicks in immediate succession. 2) Observe resulting basket state.
- **Expected Result**: Resulting state is consistent with the defined single-click-repeated outcome from TS-19, with no race-condition corruption.

### TS-22: Navigating away and back preserves the basket entry [FR-08]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Book already added per TS-04.
- **Test Data**: Same product page; homepage as intermediate navigation target.
- **Steps**: 1) Add book to basket. 2) Navigate to homepage. 3) Navigate back to the original product page or basket view. 4) Inspect basket state.
- **Expected Result**: Basket still contains exactly one entry for that book at the previously set quantity.

### TS-23: Navigation alone never increases basket count — Negative [FR-08]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Book already added per TS-04.
- **Test Data**: Same product page; homepage as intermediate navigation target.
- **Steps**: 1) Record basket count after the initial add. 2) Navigate to homepage and back without clicking "Add to basket" again. 3) Compare basket count.
- **Expected Result**: Basket count is unchanged by navigation alone.

### TS-24: Basket state survives a page reload — Boundary [FR-08]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Book already added per TS-04.
- **Test Data**: Same product page.
- **Steps**: 1) Add book to basket. 2) Reload the current page. 3) Inspect basket state.
- **Expected Result**: Basket entry and quantity persist across the reload within the same session.

---

## Test Data Summary

| Data Set | Values | Purpose |
|----------|--------|---------|
| Target book (primary) | First book listed on http://books.toscrape.com homepage | Canonical subject for most scenarios |
| Secondary book | A different book from a distinct category | Cross-check that confirmation never mismatches books (TS-08) |
| Long/special-character title book | A catalogue book with an apostrophe or ampersand (e.g. "It's Only the Himalayas") | Verifies FR-03 boundary condition for title rendering (TS-09) |
| Valid quantity | 3 | Confirms quantity > 1 is honoured (TS-13) |
| Boundary quantity | 1 | Confirms lower valid boundary (TS-12) |
| Fractional quantity | 1.5 | Confirms non-whole-number rejection/rounding (TS-14) |
| Maximum stock quantity | Equal to a book's displayed in-stock count | Confirms upper valid boundary is accepted (TS-15) |
| Invalid quantities | 0, -1, "abc", "" | Confirms invalid input rejection/normalisation (TS-16–TS-18) |
| Rapid click count | 5 | Stress-checks repeat-click handling (TS-21) |

---

## Dependencies / Environment

- **Target application**: http://books.toscrape.com (public, no authentication, static demo catalogue with a Django-Oscar-derived UI).
- **Desktop viewport**: 1280 × 720 or wider.
- **No live-site verification performed at this stage**: this specification was produced directly from the raw feature requirement in a single pass, with no upstream User Story and no separate developer investigation of the live DOM. All selectors and mechanisms above (confirmation message, basket counter, quantity field) are the Business Analyst's best assumption based on standard e-commerce/Django-Oscar conventions, not confirmed observation.
- **Risk this creates**: if the live site's actual "Add to basket" implementation differs from these assumptions (e.g. a missing confirmation mechanism, no quantity field, or the control existing only on listing/grid views rather than the product detail page), that mismatch will only surface once these scenarios are implemented and executed against the real site — there is no dedicated verification stage in this baseline condition to catch it beforehand.
- **No test data setup/teardown assumed**: anonymous, stateless browsing; each test run should assume no prior basket state persists across sessions unless execution proves otherwise.
