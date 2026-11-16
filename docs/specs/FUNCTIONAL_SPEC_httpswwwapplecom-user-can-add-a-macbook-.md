# Functional Specification: httpswwwapplecom-user-can-add-a-macbook-

## Source
docs/specs/USER_STORY_httpswwwapplecom-user-can-add-a-macbook-.md

## Application Under Test
- **Name**: Apple Online Store
- **URL**: https://www.apple.com
- **Type**: E-commerce / product information (global retail storefront)
- **Storefront**: US (https://www.apple.com) — any country/region selector must be dismissed to reach the US store

---

## Functional Requirements

### FR-01: Mac Section Navigation
**Description**: The user can navigate from the Apple homepage to the Mac product section and reach a MacBook product listing page (MacBook Air or MacBook Pro).
**Input**: User clicks the "Mac" item in the main site navigation header.
**Expected Output / State Change**: Browser navigates to the Mac overview or MacBook-specific page displaying available MacBook models.
**Validation Rules**:
- The Mac navigation entry must be visible and clickable in the site header.
- At least one MacBook model (Air or Pro) must be accessible from the Mac section.
- The resulting page must display a product name containing "MacBook".

---

### FR-02: MacBook Product Page Access
**Description**: The user can open a specific MacBook model's product detail page where configuration options and the "Add to Bag" button are present.
**Input**: User clicks a MacBook model link (e.g. "MacBook Air" or "MacBook Pro") from the Mac section.
**Expected Output / State Change**: The MacBook product page loads displaying the product name, price, configuration selectors, and an "Add to Bag" or "Buy" call-to-action.
**Validation Rules**:
- The product page URL must contain a MacBook-specific path (e.g. `/shop/buy-mac/macbook-air` or `/macbook-air`).
- The page title or a visible `<h1>` element must reference "MacBook".
- A price is visible on the page.

---

### FR-03: Configuration Option Selection
**Description**: The user can select non-default configuration options (chip/processor tier, memory/RAM, storage/SSD) on the MacBook product page before adding to bag.
**Input**: User interacts with configuration option controls (e.g. chip selector, memory selector, storage selector) and chooses a value different from the pre-selected default.
**Expected Output / State Change**:
- The selected option is visually indicated as active/selected (e.g. highlighted button or checked radio).
- The displayed price updates to reflect the chosen configuration.
**Validation Rules**:
- At least one configuration dimension (chip, memory, or storage) must offer more than one selectable option.
- Selecting a higher-tier option must increase the displayed price relative to the base configuration.
- The "Add to Bag" button must remain present and actionable after configuration changes.

---

### FR-04: Add to Bag — Default Configuration
**Description**: The user can add a MacBook to the shopping bag using the default (pre-selected) configuration without manually changing any options.
**Input**: User lands on a MacBook product page with default options pre-selected and clicks the "Add to Bag" button.
**Expected Output / State Change**:
- The MacBook is added to the shopping bag.
- A confirmation is presented (modal overlay, inline message, or navigation to bag page) indicating the item was added successfully.
- The bag icon/counter in the site header increments to reflect at least 1 item.
**Validation Rules**:
- The "Add to Bag" button must be visible and enabled when default options are selected.
- A confirmation signal (modal, toast, or bag-view redirect) must appear within the same page session.
- The bag counter must show a value ≥ 1 after the action.

---

### FR-05: Add to Bag — Custom Configuration
**Description**: The user can add a MacBook with a non-default configuration; the bag must store and display the exact configuration and corresponding price.
**Input**: User selects a non-default chip tier, memory, or storage option, then clicks "Add to Bag".
**Expected Output / State Change**:
- The bag contains the MacBook with the user-selected configuration options.
- The price displayed in the bag matches the price shown on the product page at the time of adding.
**Validation Rules**:
- The configuration summary in the bag must reference the non-default option(s) selected by the user.
- Price in bag must equal the price shown on the product page for that configuration (within rounding).

---

### FR-06: Bag Icon / Counter Update
**Description**: After adding a MacBook, the bag icon in the site navigation header visually updates to indicate at least one item is present.
**Input**: User adds a MacBook to the bag from an initial empty-bag state.
**Expected Output / State Change**: The header bag icon displays a numeric badge or counter showing a value ≥ 1.
**Validation Rules**:
- The counter must be visible in the header without any additional user action.
- The counter value must be a positive integer corresponding to the number of MacBooks added.
- Starting from a zero/empty-bag state, the counter transitions from 0 (or hidden) to 1.

---

### FR-07: Bag Persistence Across Navigation
**Description**: A MacBook added to the bag remains in the bag after the user navigates away from the product page to another page on the site (e.g. the homepage).
**Input**: User adds MacBook to bag, then navigates to the Apple homepage or another internal page.
**Expected Output / State Change**: On reopening the bag, the MacBook item previously added is still present with the same configuration and price.
**Validation Rules**:
- The bag must not reset or clear on a standard same-session page navigation.
- The item count shown in the header must remain ≥ 1 after navigation.
- The bag contents must match what was added before navigation.

---

### FR-08: Bag View — Product Details Display
**Description**: The user can open the shopping bag and see the MacBook's product name, configuration summary, and price.
**Input**: User clicks the bag icon in the site header after having added a MacBook.
**Expected Output / State Change**: The bag view (page or modal/drawer) is displayed, showing:
- MacBook product name (e.g. "MacBook Air 13-inch")
- Configuration summary (e.g. chip, memory, storage specs)
- Unit price for the item
**Validation Rules**:
- The product name must include "MacBook".
- At least one configuration attribute (chip, memory, or storage) must be visible.
- A numeric price must be displayed for the line item.

---

### FR-09: Item Removal from Bag
**Description**: The user can remove the MacBook from the bag, leaving the bag empty and resetting the bag counter to zero.
**Input**: User opens the bag view, locates the MacBook line item, and activates the remove/delete control.
**Expected Output / State Change**:
- The MacBook is removed from the bag.
- The bag view shows an empty state (zero items, empty-bag message, or similar).
- The bag icon/counter in the header returns to zero or the empty-bag indicator.
**Validation Rules**:
- A remove control (button, link, or icon) must be visible per line item in the bag.
- After removal, the MacBook must not appear in the bag item list.
- The header counter must decrement to 0 (or become hidden/empty).

---

### FR-10: Deep-Link Direct Product Page Access
**Description**: The user can navigate directly to a MacBook product page via a deep URL and add the product to the bag without first visiting the Mac section.
**Input**: User loads a MacBook product URL directly (e.g. `https://www.apple.com/shop/buy-mac/macbook-air`).
**Expected Output / State Change**: The product page loads correctly with full functionality (configuration options and "Add to Bag" available).
**Validation Rules**:
- The page must load without redirect errors or authentication walls.
- Configuration and Add to Bag features must be accessible without prior navigation steps.

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---|---|---|
| `nav[role="navigation"] a[href*="mac"]` | Navigation link | Navigates to the Mac section when clicked |
| `a[href*="macbook-air"], a[href*="macbook-pro"]` | Product link | Opens the specific MacBook product page |
| `h1` (on product page) | Heading | Contains "MacBook" product name |
| `.price, [data-commerce-component*="price"]` | Text/price display | Shows current configuration price; updates on option change |
| `[data-component="configurationSelector"] button`, `[role="radio"]` | Radio/toggle button | Configuration option selector (chip, memory, storage); selected state visually indicated |
| `button[data-autom="add-to-cart-button"]`, `button[data-store-action*="add"]` | Button | "Add to Bag" CTA; enabled when valid configuration selected |
| `.rs-storebag-count`, `[data-analytics-region*="bag"] span` | Badge/counter | Numeric bag item count displayed in site header |
| `[data-analytics-region*="bag"], a[href*="/shop/bag"]` | Icon / link | Bag icon in header; clickable to open bag view |
| `.rc-checkout-bag-item`, `[data-commerce-component*="cartItem"]` | List item | Individual line item in bag view showing product name, config, price |
| `button[data-autom="bag-item-remove"]`, `button[aria-label*="Remove"]` | Button | Per-line-item remove control in bag view |
| `.rc-bagview-empty, [data-autom="bag-empty"]` | Container | Empty bag state indicator shown after all items removed |

> **Note for Developer Agent**: Apple.com does not expose `data-test` attributes. Selectors above are indicative patterns; the developer agent must inspect the live site to confirm actual attribute names and values before writing test scripts. Selectors likely vary by MacBook model page and storefront variant.

---

## Test Scenarios

### TS-01: Navigate to MacBook Product Page from Homepage [FR-01, FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Browser is at https://www.apple.com; no prior navigation; any country selector is dismissed.
- **Test Data**: No input data required; use live site navigation.
- **Steps**:
  1. Open https://www.apple.com.
  2. Dismiss any country/region modal if present.
  3. Locate and click the "Mac" item in the main navigation header.
  4. Locate a MacBook Air or MacBook Pro product link and click it.
- **Expected Result**: A MacBook product page loads. The `<h1>` contains "MacBook". A price is visible. Configuration options and an "Add to Bag" button are present on the page.

---

### TS-02: Add MacBook to Bag with Default Configuration [FR-04, FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: User is on a MacBook product page with default configuration pre-selected; bag is empty.
- **Test Data**: MacBook Air (default chip/memory/storage — whatever is pre-selected on page load).
- **Steps**:
  1. Navigate to a MacBook product page.
  2. Do not change any configuration options.
  3. Click the "Add to Bag" button.
  4. Observe the confirmation signal and header bag counter.
- **Expected Result**: A confirmation is shown (modal, overlay, or redirect to bag). The header bag counter displays 1 (or becomes non-zero).

---

### TS-03: Add MacBook to Bag with Custom Configuration [FR-03, FR-05, FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: User is on a MacBook product page; bag is empty; at least one configuration option has more than one selectable value.
- **Test Data**: Select the highest-tier chip option and/or maximum storage option available on the page.
- **Steps**:
  1. Navigate to a MacBook product page.
  2. Select a non-default chip or storage option.
  3. Note the price displayed after selection.
  4. Click "Add to Bag".
  5. Open the bag view.
- **Expected Result**: Bag contains the MacBook with the selected non-default options visible in the configuration summary. Price in bag matches the price noted in step 3.

---

### TS-04: Bag Counter Increments After Add [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: User is on a MacBook product page; bag counter is 0 or not visible (empty bag state).
- **Test Data**: Default MacBook configuration.
- **Steps**:
  1. Note current bag counter value (expect 0 or empty).
  2. Add the MacBook to the bag.
  3. Observe the bag icon in the header.
- **Expected Result**: The bag icon/counter transitions from 0 (or hidden) to 1.

---

### TS-05: Bag Persists After Navigating to Homepage [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: User has added one MacBook to the bag.
- **Test Data**: MacBook (any configuration).
- **Steps**:
  1. Add a MacBook to the bag.
  2. Navigate to https://www.apple.com (homepage).
  3. Click the bag icon in the header.
- **Expected Result**: The bag view shows the MacBook previously added. Item count in header remains ≥ 1.

---

### TS-06: Bag View Displays Product Name, Configuration, and Price [FR-08]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: User has added a MacBook with a known configuration to the bag.
- **Test Data**: MacBook Air with selected configuration (note exact options and price before adding).
- **Steps**:
  1. Add MacBook to bag.
  2. Click the bag icon or navigate to bag view.
  3. Inspect the line item in the bag.
- **Expected Result**: The line item shows: (a) product name containing "MacBook", (b) at least one configuration attribute (chip, memory, or storage), (c) a numeric price matching the product page price.

---

### TS-07: Remove MacBook from Bag [FR-09]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: User has added one MacBook to the bag; bag contains exactly one item.
- **Test Data**: Any MacBook configuration.
- **Steps**:
  1. Open the bag view.
  2. Locate the MacBook line item.
  3. Click the remove/delete control.
  4. Observe the bag state and header counter.
- **Expected Result**: The MacBook is no longer listed in the bag. An empty-bag message or state is shown. The header counter returns to 0 or the icon reverts to the empty-bag state.

---

### TS-08: Direct Deep-Link to MacBook Product Page [FR-10, FR-02]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: No prior navigation on the site; bag is empty.
- **Test Data**: Direct URL to MacBook product page (e.g. `/shop/buy-mac/macbook-air`).
- **Steps**:
  1. Load the MacBook product page URL directly without prior navigation through the homepage.
  2. Observe page load and availability of configuration controls and "Add to Bag".
  3. Add to bag.
- **Expected Result**: Page loads without error. Configuration options and "Add to Bag" are fully functional. MacBook is added to bag successfully.

---

### TS-09: Configuration Price Updates on Option Change [FR-03]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: User is on a MacBook product page with multiple configuration tiers available.
- **Test Data**: Compare base (default) vs. one step-up configuration.
- **Steps**:
  1. Record the displayed price for the default configuration.
  2. Select the next-tier chip or storage option.
  3. Record the updated price.
- **Expected Result**: The price after selecting a higher tier is strictly greater than the default price.

---

### TS-10: "Add to Bag" Button State with No Mandatory Configuration Selected [FR-03, FR-04]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: User is on a MacBook product page where a configuration step is required before "Add to Bag" becomes active (if applicable on the live site).
- **Test Data**: Page load state with no user interaction after arriving on the page.
- **Steps**:
  1. Navigate to a MacBook product page.
  2. Do not interact with any configuration controls.
  3. Observe whether the "Add to Bag" button is enabled or disabled.
  4. If disabled, do not click it; if enabled, proceed to add and verify defaults are applied.
- **Expected Result**: Either (a) the "Add to Bag" button is enabled with default values pre-selected and the add succeeds, or (b) the button is disabled/hidden and a configuration prompt is shown before it becomes active. In neither case should an error state occur with no product in the bag.

---

### TS-11: Adding Same MacBook Model Twice [FR-04, FR-06, FR-08]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: User adds the same MacBook model and configuration twice in the same session.
- **Test Data**: Same MacBook Air default configuration added twice sequentially.
- **Steps**:
  1. Navigate to MacBook product page; add to bag (first add).
  2. Navigate back to the same MacBook product page.
  3. Add the same item to the bag again (second add).
  4. Open bag view.
- **Expected Result**: The bag reflects either (a) a quantity of 2 for the same line item, or (b) two separate line items for the same MacBook. The header counter reflects 2 total items. No error is thrown.

---

### TS-12: Bag State as Guest (No Apple ID Sign-In) [FR-04, FR-07]
- **Type**: Negative / Boundary
- **Priority**: High
- **Preconditions**: User is not signed into an Apple ID; browser has no active Apple ID session.
- **Test Data**: Any MacBook configuration added without signing in.
- **Steps**:
  1. Ensure no Apple ID session is active (use a fresh private/incognito browser context).
  2. Navigate to a MacBook product page.
  3. Click "Add to Bag".
  4. Observe whether a sign-in prompt appears or the item is added to a guest bag.
- **Expected Result**: The system either (a) adds the item to a guest/session bag without requiring sign-in, or (b) if sign-in is prompted, the prompt is clearly shown. The user must not be blocked from adding to bag in guest mode per the user story assumptions.

---

### TS-13: Bag Counter Does Not Show for Empty Bag [FR-06, FR-09]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Bag is empty (fresh session or after removing all items).
- **Test Data**: N/A (empty bag state).
- **Steps**:
  1. Start with an empty bag (fresh browser session).
  2. Inspect the bag icon in the header.
- **Expected Result**: The bag counter shows 0 or is hidden/absent when the bag is empty. No non-zero count is displayed for an empty bag.

---

### TS-14: Bag Counter Decrements to Zero After Item Removal [FR-09, FR-06]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Bag contains exactly 1 MacBook.
- **Test Data**: One MacBook item in bag.
- **Steps**:
  1. Add a MacBook to the bag (counter = 1).
  2. Open the bag view.
  3. Remove the MacBook.
  4. Observe the header bag counter.
- **Expected Result**: Counter transitions from 1 to 0 (or counter badge disappears). The bag shows an empty state.

---

### TS-15: MacBook Product Page Contains Required Elements [FR-02, FR-03]
- **Type**: Positive (structural/smoke)
- **Priority**: High
- **Preconditions**: User navigates to a MacBook product page.
- **Test Data**: MacBook Air or MacBook Pro product page URL.
- **Steps**:
  1. Load the MacBook product page.
  2. Assert presence of: product name heading, price, configuration selectors, "Add to Bag" button.
- **Expected Result**: All four elements are present and visible on the page.

---

## Test Data Summary

| Data Set | Values | Purpose |
|---|---|---|
| Default MacBook configuration | Pre-selected options on MacBook Air or MacBook Pro product page load | TS-02, TS-04, TS-07, TS-12, TS-14 |
| Custom / upgraded configuration | Next-tier chip option and/or maximum storage option available on product page | TS-03, TS-09 |
| Same-model duplicate add | Default MacBook Air added twice in one session | TS-11 |
| Guest session (no Apple ID) | Fresh incognito/private browser context, no Apple ID cookies | TS-12 |
| Empty bag state | Fresh browser session before any add action | TS-01, TS-13 |
| Deep-link URL | Direct URL to MacBook product page without prior site navigation | TS-08 |

---

## Dependencies / Environment

- **Target URL**: https://www.apple.com (US storefront)
- **Browser**: Chromium (Playwright default); no Apple ID sign-in required
- **Session handling**: Guest bag (session-based); tests should use a fresh browser context per test to avoid bag state bleed-over
- **Country selector**: Any region/country modal that appears on first visit must be dismissed before test steps proceed; Playwright tests should handle this as a precondition step
- **Dynamic UI**: Apple.com is a JavaScript-heavy SPA; tests must wait for elements to be visible/enabled rather than relying on fixed timeouts
- **Configuration requirement**: Some MacBook pages require the user to select a configuration before "Add to Bag" becomes active — the developer agent must verify this behaviour on the live site and account for it in implementation
- **Scope boundary**: Tests cover navigation, configuration, add-to-bag, bag display, persistence, and removal only — checkout, payment, Apple ID login, and financing flows are out of scope
- **Selector discovery**: All UI selectors in the UI Elements table are indicative; the developer agent must visit the live site and confirm actual DOM attributes before writing Playwright scripts
- **Live site dependency**: Tests run against the live production Apple website; results may be affected by A/B tests, promotional banners, or regional redirects outside the test's control
