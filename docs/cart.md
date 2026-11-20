# Cart API

The Cart API handles all shopping cart operations — adding items, updating quantities, applying coupons, and managing the cart state. Access it through `useCartMutations()` and `useCart()` hooks, or directly via `useCoCart()`.

## Hooks Overview

```tsx
import { useCart, useCartMutations, useCoCart } from '@cocartheadless/react-native-sdk';

// Cart state
const { cart, loading, error, refresh } = useCart();

// Mutations
const {
  addItem, removeItem, updateItem, clear,
  removeAllItems, changePlan, applyCoupon, removeCoupon, removeCoupons,
} = useCartMutations();

// Direct client access for everything else
const client = useCoCart();
```

## useCart

Fetches the cart on mount and exposes the current state. It waits for `CoCartProvider` to read the stored cart key first, so a returning guest sees their own cart. Pass `{ mini: true }` for the lighter mini cart (CoCart Plus).

```tsx
function CartScreen() {
  const { cart, loading, error, refresh } = useCart();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Items: {cart?.getItemCount()}</Text>
      <Text>Total: {cart?.get('totals.total')}</Text>
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

## useCartMutations

```tsx
function ProductCard({ product }) {
  const { addItem } = useCartMutations();
  const { refresh } = useCart();

  async function handleAdd() {
    await addItem(product.id, 1);
    refresh(); // re-fetch cart to show updated count
  }

  return <Button title="Add to Cart" onPress={handleAdd} />;
}
```

### addItem

```tsx
const { addItem } = useCartMutations();

// Simple product
await addItem(123, 2);

// With options
await addItem(123, 1, {
  item_data: { gift_message: 'Happy Birthday!' },
});
```

#### Choices for CoCart Plus's supported plugins

The options also carry the customer's choice for a plugin CoCart Plus supports; other plugins' fields pass through too:

```tsx
// A subscription plan: an option's `value` from the product's
// extensions.subscription_schemes ('0' is one-time)
await addItem(306, 1, { convert_to_sub: '1_month_0' });

// A gift recipient (Gifting for WooCommerce Subscriptions)
await addItem(302, 1, { recipient_email: 'friend@example.com' });

// A warranty: an option's `key` from the product's extensions.warranty.options
await addItem(154, 1, { item_data: { warranty: '1-year' } });
```

The options are typed as `AddItemOptions`. The data these plugins add under `extensions` is typed too (`CartExtensions`, `CartItemExtensions`, `ProductExtensions`); see Extension Data in the [TypeScript SDK docs](https://cocartapi.com/docs).

### removeItem

```tsx
await removeItem('abc123def456...');
```

### updateItem

```tsx
await updateItem('abc123def456...', 3);
```

### clear

```tsx
await clear();
```

`clear()` empties the whole cart, coupons and fees included.

### removeAllItems

> Requires CoCart Plus.

Removes every item but keeps the cart's coupons, fees and customer details:

```tsx
await removeAllItems();
```

### changePlan

> Requires CoCart Plus.

Switches a cart item to another subscription plan, or to one-time with `'0'`. The options are in the item's `extensions.subscription_schemes`; the current one is `selected`:

```tsx
const item = cart.getItems()[0];
const other = item.extensions.subscription_schemes?.find((o) => !o.selected);
if (other) await changePlan(item.item_key, other.value);
```

### Coupons

> Requires CoCart Plus.

```tsx
await applyCoupon('SAVE10');
await applyCoupon('VIP20', 'jane@example.com'); // a coupon restricted to certain emails
await removeCoupon('SAVE10');
await removeCoupons(); // all of them
```

## Direct Client Access

For operations not covered by the hooks, use `useCoCart()` to access the full Cart API:

```tsx
import { useCoCart } from '@cocartheadless/react-native-sdk';

function CartScreen() {
  const client = useCoCart();

  // Add a variable product
  await client.cart().addVariation(456, 1, {
    attribute_pa_color: 'blue',
    attribute_pa_size: 'large',
  });

  // Choose a shipping rate
  await client.cart().setShippingMethod('flat_rate:1');

  // Add a fee: name, amount, taxable, and an optional tax class (CoCart Plus)
  await client.cart().addFee('Gift wrapping', 5, true);

  // The mini cart (CoCart Plus)
  const mini = await client.cart().getMini();

  // Get totals
  const totals = await client.cart().getTotals();
}
```

## Client-Side Validation

The SDK validates inputs before making a network request:

```tsx
import { ValidationError } from '@cocartheadless/react-native-sdk';

try {
  await addItem(-1, 0);
} catch (e) {
  if (e instanceof ValidationError) {
    // e.message => "Product ID must be a positive integer"
    // No network request was made
  }
}
```

## Working with Cart Responses

Every cart method returns a `Response` object. Access data with dot-notation or helper methods:

```tsx
const { cart } = useCart();

if (cart) {
  // Item count
  const count = cart.getItemCount();       // number

  // Dot-notation access
  const total = cart.get('totals.total');          // e.g. '4599'
  const subtotal = cart.get('totals.subtotal');
  const firstItem = cart.get('items.0.name');

  // Check state
  cart.hasItems();    // true if items exist
  cart.isEmpty();     // true if cart is empty
  cart.hasCoupons();  // true if coupons are applied

  // Notices, keyed by type: { success: ['"Beanie" has been added to your cart.'] }
  cart.getNotices();  // {} when there are none

  // Shipping packages as a list, each with `rates` keyed by rate ID and `chosen_method`
  cart.getShippingMethods();
  cart.getShipping(); // the whole field: total_packages, has_calculated_shipping, packages…

  cart.getFees();       // the fees as a list
  cart.getExtensions(); // data plugins add, e.g. subscription recurring_totals
  cart.getRateLimit();  // { limit, remaining, reset, retryAfter } from the RateLimit-* headers (CoCart Plus)

  // Raw object
  const data = cart.toObject();
}
```

Amounts are minor-unit strings (`'4599'` for 45.99); see `CurrencyFormatter` in [Utilities](utilities.md).

## Expired Guest Carts

CoCart Starter 5 refuses a guest cart key whose cart no longer exists (for example after it expired) with `cocart_invalid_cart`. The client then forgets the stored cart key and retries the request once as a new guest, so the customer starts a fresh cart instead of seeing an error.

## ETag / Conditional Requests

The SDK sends `If-None-Match` headers automatically to avoid re-downloading unchanged cart data. ETag is enabled by default.

```tsx
// Disable for all requests
<CoCartProvider siteURL="..." options={{ etag: false }}>

// Check if response was unchanged
const response = await client.cart().get();
if (response.isNotModified()) {
  console.log('Cart has not changed');
}
```

See the full Cart API documentation for all available methods (coupons, shipping, fees, cross-sells, etc.) in the [TypeScript SDK docs](https://cocartapi.com/docs).
