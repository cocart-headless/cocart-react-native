# Hooks Reference

All hooks must be used inside a component wrapped by `<CoCartProvider>`.

## useCoCart

Returns the raw `CoCart` client instance. Use this when you need to call methods not covered by the other hooks.

```tsx
import { useCoCart } from '@cocartheadless/react-native-sdk';

function MyComponent() {
  const client = useCoCart();

  async function handleAction() {
    const response = await client.cart().applyCoupon('SAVE20');
  }
}
```

Throws `Error('useCoCart must be used within <CoCartProvider>')` if called outside the provider.

### Waiting for the Stored Cart Key

`CoCartProvider` reads the stored cart key when it's created. With `AsyncStorageAdapter` that takes a moment, and your components' effects run before the provider's. `useCart` and `useCartMutations` wait for it, so a returning guest gets their own cart. When you call the client yourself as a screen mounts, wait for it too, with `useCoCartContext()`:

```tsx
import { useCoCartContext } from '@cocartheadless/react-native-sdk';

function CartBadge() {
  const { client, sessionRestored } = useCoCartContext();
  const [count, setCount] = useState(0);

  useEffect(() => {
    sessionRestored
      .then(() => client.cart().get())
      .then((cart) => setCount(cart.getItemCount()));
  }, [client, sessionRestored]);
}
```

`sessionRestored` never rejects: if the key can't be read, the client starts a new cart. With `MMKVStorage` (synchronous) the key is read when the client is created, so it's settled at once.

---

## useCart

Fetches the cart on mount and exposes current state plus a refresh function.

```tsx
const { cart, loading, error, refresh } = useCart();

// The lighter mini cart (CoCart Plus), for a cart badge or drawer
const { cart: mini } = useCart({ mini: true });
```

| Property | Type | Description |
|----------|------|-------------|
| `cart` | `Response \| null` | Current cart response, or `null` if not yet loaded |
| `loading` | `boolean` | `true` while fetching |
| `error` | `Error \| null` | Error from the last fetch attempt, or `null` |
| `refresh` | `() => Promise<void>` | Re-fetch the cart manually |

### Behaviour

- Fetches the cart once on mount, after the stored cart key has been read.
- Sets `loading: true` at the start of each fetch and `loading: false` when done.
- On error, sets `error` and keeps `cart` as its last successful value (or `null` on first load).
- Does not retry automatically on error — call `refresh()` to retry.

### Example

```tsx
function CartScreen() {
  const { cart, loading, error, refresh } = useCart();

  if (loading) return <ActivityIndicator />;
  if (error)   return <Button title="Retry" onPress={refresh} />;

  return (
    <View>
      <Text>Items: {cart?.getItemCount()}</Text>
      <Text>Total: {cart?.get('totals.total')}</Text>
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

---

## useCartMutations

Returns functions for modifying the cart. All functions return a Promise — `await` them or handle errors in a `try/catch`.

```tsx
const {
  addItem, removeItem, updateItem, clear,
  removeAllItems, changePlan, applyCoupon, removeCoupon, removeCoupons,
} = useCartMutations();
```

Each one waits for the stored cart key first, so the change lands in a returning guest's cart.

### addItem

```tsx
addItem(productId: string | number, quantity: number, options?: AddItemOptions): Promise<Response>
```

```tsx
await addItem(123, 2);
await addItem('BLUE-SHIRT-L', 1); // a SKU also works
await addItem(123, 1, { item_data: { gift_message: 'Happy Birthday!' } });

// Choices for CoCart Plus's supported plugins (see Extension Data in the core SDK docs)
await addItem(306, 1, { convert_to_sub: '1_month_0' });              // a subscription plan
await addItem(302, 1, { recipient_email: 'friend@example.com' });    // a gift recipient
await addItem(154, 1, { item_data: { warranty: '1-year' } });         // a warranty
```

### removeItem

```tsx
removeItem(itemKey: string): Promise<Response>
```

```tsx
await removeItem('abc123def456...');
```

`itemKey` is the `item_key` field from a cart item in the cart response.

### updateItem

```tsx
updateItem(itemKey: string, quantity: number, options?: Record<string, unknown>): Promise<Response>
```

```tsx
await updateItem('abc123def456...', 3);
```

### clear

```tsx
clear(): Promise<Response>
```

```tsx
await clear();
```

`clear()` empties the whole cart, coupons and fees included.

### removeAllItems

> Requires CoCart Plus.

```tsx
removeAllItems(): Promise<Response>
```

Removes every item but keeps the cart's coupons, fees and customer details.

### changePlan

> Requires CoCart Plus.

```tsx
changePlan(itemKey: string, value: string): Promise<Response>
```

Switches a cart item to another subscription plan, or to one-time with `'0'`. The options are in the item's `extensions.subscription_schemes`; pass one's `value`.

### applyCoupon, removeCoupon, removeCoupons

> Requires CoCart Plus.

```tsx
applyCoupon(code: string, email?: string): Promise<Response>
removeCoupon(code: string): Promise<Response>
removeCoupons(): Promise<Response>
```

```tsx
await applyCoupon('SAVE10');
await applyCoupon('VIP20', 'jane@example.com'); // a coupon restricted to certain emails
await removeCoupon('SAVE10');
await removeCoupons(); // all of them
```

### After Mutations

Mutations do not automatically refresh the `useCart` state. Call `refresh()` from `useCart` after a mutation to keep the displayed cart in sync:

```tsx
function AddToCartButton({ productId }) {
  const { addItem } = useCartMutations();
  const { refresh } = useCart();

  async function handlePress() {
    await addItem(productId, 1);
    refresh();
  }

  return <Button title="Add to Cart" onPress={handlePress} />;
}
```

---

## useProducts

Fetches products and exposes state plus a refresh function.

```tsx
const { products, loading, error, refresh } = useProducts(options?);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `category` | `string` | — | Filter by category slug |
| `tag` | `string` | — | Filter by tag slug |
| `filters` | `Record<string, string>` | — | Extra query params for `products().all()` |
| `autoFetch` | `boolean` | `true` | Fetch on mount |

| Return Value | Type | Description |
|-------------|------|-------------|
| `products` | `Response \| null` | Product list response |
| `loading` | `boolean` | `true` while fetching |
| `error` | `Error \| null` | Error from last fetch, or `null` |
| `refresh` | `() => Promise<void>` | Re-fetch manually |

### Fetch Priority

1. If `category` is set → calls `client.products().byCategory(category)`
2. Else if `tag` is set → calls `client.products().byTag(tag)`
3. Else → calls `client.products().all(filters)`

### Examples

```tsx
// All products
useProducts()

// By category
useProducts({ category: 'shirts' })

// By tag
useProducts({ tag: 'sale' })

// Custom filters (CoCart rejects plain 'price': sort with price_asc or price_desc)
useProducts({ filters: { per_page: '24', orderby: 'price_asc' } })

// Manual control
const { products, refresh } = useProducts({ autoFetch: false });
// fetch when ready:
useEffect(() => { refresh(); }, [someCondition]);
```

---

## useAccount

Returns stable callbacks for all customer account operations. They require the customer to be authenticated, except `register`, the guest order lookups and `requestOrderWithdrawal`.

```tsx
const {
  register,
  getProfile,
  updateProfile,
  changePassword,
  updateAddress,
  getOrders,
  getOrder,
  getGuestOrder,
  cancelOrder,
  getOrderDownloads,
  getGuestOrderDownloads,
  getDownloads,
  getReviews,
  verifyEmail,
  sendOrderEmailVerification,
  verifyOrderEmail,
  getSubscriptions,
  getSubscription,
  suspendSubscription,
  reactivateSubscription,
  cancelSubscription,
  setSubscriptionAutoRenew,
  updateSubscriptionPaymentMethod,
  resubscribe,
  cancelResubscribe,
  requestOrderWithdrawal,
} = useAccount();
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `register` | `(data: RegisterCustomerInput) => Promise<Response>` | Register a new customer (CoCart Plus) |
| `getProfile` | `() => Promise<Response>` | Get the authenticated customer's profile |
| `updateProfile` | `(data: AccountUpdateInput) => Promise<Response>` | Update profile fields |
| `changePassword` | `(data: AccountChangePasswordInput) => Promise<Response>` | Change password: sends only `current`, `password` and `confirm`; the rest of the account is left as it is |
| `updateAddress` | `(data: AccountAddressUpdateInput) => Promise<Response>` | Save the billing and/or shipping address |
| `getOrders` | `(params?: AccountOrdersParams) => Promise<Response>` | List orders: `{ orders, pagination }`. Filter by `status`, `after`, `before`, `subscription_order_type` |
| `getOrder` | `(id: number) => Promise<Response>` | Get a single order |
| `getGuestOrder` | `(id: number, email: string) => Promise<Response>` | Get an order without authentication |
| `cancelOrder` | `(id: number) => Promise<Response>` | Cancel an order where WooCommerce allows it |
| `getOrderDownloads` | `(id: number) => Promise<Response>` | Downloads for an order (`GET my-account/orders/{id}/downloads`), as a list |
| `getGuestOrderDownloads` | `(id: number, email: string) => Promise<Response>` | Downloads for a guest order, in the same shape |
| `getDownloads` | `() => Promise<Response>` | All downloads for the customer, as a list |
| `getReviews` | `(params?: Record<string, string>) => Promise<Response>` | Reviews written by the customer |
| `verifyEmail` | `(key: string, userId: number) => Promise<Response>` | Confirm a pending email change |
| `sendOrderEmailVerification` | `() => Promise<Response>` | Email a link that links past guest orders to the account |
| `verifyOrderEmail` | `(key: string, userId: number) => Promise<Response>` | Confirm that link |
| `getSubscriptions` | `(params?: AccountOrdersParams) => Promise<Response>` | List subscriptions (WooCommerce Subscriptions) |
| `getSubscription` | `(id: number, email?: string) => Promise<Response>` | Get a subscription; pass the email as a guest |
| `suspendSubscription` / `reactivateSubscription` / `cancelSubscription` | `(id: number) => Promise<Response>` | Change a subscription's status |
| `setSubscriptionAutoRenew` | `(id: number, enabled: boolean) => Promise<Response>` | Turn automatic renewal on or off |
| `updateSubscriptionPaymentMethod` | `(id: number, data: AccountSubscriptionPaymentMethodInput) => Promise<CheckoutResult>` | Change the renewal payment method, to a saved card (`token_id`) or a new one (`payment_data`); a new card may need 3D Secure ([details](account.md#changing-a-subscriptions-payment-method)) |
| `resubscribe` / `cancelResubscribe` | `(id: number) => Promise<Response>` | Put an ended subscription's items in the cart, or undo it |
| `requestOrderWithdrawal` | `(data: OrderWithdrawalInput) => Promise<Response>` | Submit an order withdrawal request |

See the [Account API](account.md) guide for full usage examples.

---

## Checkout Hooks

Checkout (CoCart Plus 2.0) comes from `@cocartheadless/checkout`. Add `createCheckout()` to the provider's `extensions`; the checkout hooks throw if it isn't there:

```tsx
import { createCheckout } from '@cocartheadless/checkout';

<CoCartProvider siteURL="https://your-store.com" extensions={[createCheckout()]}>
```

| Hook | Returns | Description |
|------|---------|-------------|
| `useCheckout()` | `{ checkout, loading, error, refresh }` | The checkout for the current cart: `items`, `totals`, `total_lines`, `payment`, `customer`, `delivery.packages`. Use it on the review screen: it records the total the customer sees. Updates when `update()` saves a change |
| `usePaymentMethods({ gateway? })` | `{ methods, savedCards, loading, error, refresh }` | The cart's payment methods (a list, in the store's order), and the customer's saved cards (`SavedPaymentMethod[]`, each with its `label`), in one request |
| `useCheckoutMutations()` | `{ update, placeOrder, getCheckoutStatus, payForOrder, confirmReturn }` | Save the customer's details (`result.not_applied` says what wasn't), place the order, find out how a checkout ended, pay for an unpaid order, finish an off-site step |
| `useOrderReceived(orderId, orderKey)` | `{ order, loading, error, refresh }` | The order, for the thank-you screen. No cart needed |
| `useCheckoutClient()` | `CheckoutSDK` | The checkout client, for `getCheckoutConfig()`, `searchAddresses()` and `getAddressDetails()` |

`useCheckout`, `usePaymentMethods`, `update()`, `placeOrder()` and `getCheckoutStatus()` wait for the stored cart key, as `useCart` does.

`placeOrder()`, `payForOrder()` and `confirmReturn()` return a `CheckoutResult`: read `isComplete`, `isAwaitingPayment`, `needsConfirmation` (3D Secure), `needsRedirect`, `isPending` and `isFailed`, with the order in `orderId`, `orderKey`, `orderNumber` and `orderStatus`. A declined card is a failed result, not a thrown error. When no answer comes back, or another payment is still running for the cart, `placeOrder()` throws `CheckoutOutcomeUnknownError`; `getCheckoutStatus(error.checkoutId)` returns `{ checkoutId, code, message, orderId, orderKey, orderNumber, orderStatus }`, with `code` `order_placed`, `payment_required`, `in_progress` or `not_placed`. See the [Checkout](checkout.md) guide.

---

## Adding Custom Hooks

To build a hook on top of the SDK:

```tsx
// src/hooks/useOrders.ts (example)
import { useCallback, useEffect, useState } from 'react';
import type { Response } from '@cocartheadless/react-native-sdk';
import { useCoCart } from '@cocartheadless/react-native-sdk';

export function useOrders() {
  const client = useCoCart();
  const [orders, setOrders] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.account().getOrders();
      setOrders(response);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { refresh(); }, [refresh]);

  return { orders, loading, error, refresh };
}
```
