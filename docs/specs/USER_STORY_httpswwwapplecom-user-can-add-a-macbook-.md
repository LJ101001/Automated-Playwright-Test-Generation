# User Story: httpswwwapplecom-user-can-add-a-macbook-

## Context
Apple.com is an e-commerce and product information site; this story covers the feature allowing a shopper to configure and add a MacBook to their shopping bag.

## Story
As a prospective buyer, I want to select a MacBook model, choose my desired configuration, and add it to my shopping bag, so that I can proceed toward purchasing the product.

## Priority: High

## Acceptance Criteria

### Scenario 1: Successfully add a MacBook to the bag with default configuration
**Given** I am on the Apple website (https://www.apple.com)
**When** I navigate to the Mac section and select a MacBook product (e.g. MacBook Air or MacBook Pro)
**And** I click the "Add to Bag" button without changing any configuration options
**Then** the product is added to my shopping bag
**And** a bag indicator or confirmation message reflects that 1 item has been added

### Scenario 2: Add a MacBook with a customised configuration
**Given** I am viewing a MacBook product page on https://www.apple.com
**When** I select non-default options (e.g. a higher-tier chip, more memory, or additional storage)
**And** I click "Add to Bag"
**Then** the bag contains the MacBook with the exact configuration I selected
**And** the price shown in the bag matches the configured product price

### Scenario 3: Bag persists the added MacBook after navigating away
**Given** I have added a MacBook to my bag on https://www.apple.com
**When** I navigate to another page on the site (e.g. the homepage)
**And** I open the bag
**Then** the MacBook I added is still present in the bag

### Scenario 4: Bag icon/counter updates after adding
**Given** I am on a MacBook product page on https://www.apple.com with an empty bag
**When** I add the MacBook to the bag
**Then** the bag icon in the site header updates to reflect a non-zero item count

### Scenario 5: User can view the bag after adding
**Given** I have added a MacBook to my bag on https://www.apple.com
**When** I click the bag icon in the navigation
**Then** I am taken to or shown the bag view
**And** the MacBook product name, configuration summary, and price are visible

### Scenario 6: User can remove the MacBook from the bag
**Given** I have added a MacBook to my bag on https://www.apple.com
**When** I open the bag and remove the item
**Then** the bag is empty
**And** the bag icon/counter reflects zero items

## Edge Cases to Cover
- Attempting to add a MacBook when no configuration options are selected (if configuration is mandatory)
- Navigating directly to a MacBook product page via a deep link and adding to bag
- Adding the same MacBook model twice and verifying quantity or duplicate line items
- Bag behaviour when the user is not signed in to an Apple ID (guest bag)
- Page behaviour if the "Add to Bag" button is not immediately visible and requires scrolling or a configuration step first

## Out of Scope
- Completing checkout or payment processing
- Apple ID login/authentication flows
- Apple Trade In or financing options
- Delivery/shipping date estimation
- Wishlist or Save for Later functionality
- Stock availability edge cases (out-of-stock configurations)

## Assumptions
- **App URL:** https://www.apple.com
- The test will be executed against the live production Apple website; no staging environment is available.
- No Apple ID credentials are required to add items to a bag — guest bag functionality is assumed to be available.
- The MacBook product line includes at least one currently purchasable model (MacBook Air or MacBook Pro) accessible from the main Mac navigation.
- "Bag" is Apple's term for the shopping cart; tests should target Apple's bag UI rather than generic cart patterns.
- The site may present region/country selection on first visit; tests assume the US storefront (https://www.apple.com) or that any country selector can be dismissed to reach the default US store.
- Configuration steps (chip, memory, storage) may be required before "Add to Bag" becomes active; this is a known flow on Apple's site.
