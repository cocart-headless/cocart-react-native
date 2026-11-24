# Account API

The Account API provides access to customer account data — registration, profile, password, address, orders, downloads, reviews and subscriptions. All methods require the customer to be authenticated (Basic Auth or JWT), except `register()`, the guest order lookups and `requestOrderWithdrawal()`.

Access via the `useAccount()` hook or directly through `useCoCart()`.

## useAccount Hook

`useAccount()` returns stable callbacks for all account operations. Every function returns a `Promise` — `await` it or handle errors in a `try/catch`.

```tsx
import { useAccount } from '@cocartheadless/react-native-sdk';

function AccountScreen() {
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
}
```

---

## Register

> Requires CoCart Plus.

Registers a new customer. It doesn't need the customer logged in:

```tsx
const response = await register({
  email: 'jane@example.com',
  requestedUsername: 'jane',              // optional if the store generates usernames from the email
  requestedPassword: 'a-strong-password', // optional if the store generates passwords
});

response.get('result.code'); // 'account_created'
response.get('id');          // 42
```

The username and password are sent as `requested_username` and `requested_password`: CoCart treats non-empty `username` and `password` fields as a Basic Auth attempt. The response is a `201` with the new customer, as `getProfile()` gives it. It doesn't log the customer in: log in next.

---

## Profile

### Get Profile

```tsx
const response = await getProfile();
const customer = response.toObject();

console.log(customer.display_name);
console.log(customer.email);
console.log(customer.billing?.formatted); // the billing address on one line
console.log(customer.stats.orders_count);
console.log(customer.recent_orders);     // the most recent orders, newest first ([] when none)
```

Every account response says what it is in `object` (`customer`, `order`, `subscription`…). A change puts what it did first, in `result` (a `code` and a `message`). An order or subscription has `allowed_actions`: the names of what the customer may do with it now (`pay`, `cancel`…).

### Update Profile

```tsx
await updateProfile({
  account_first_name: 'Jane',
  account_last_name: 'Doe',
  account_display_name: 'Jane Doe',
  account_email: 'jane@example.com',
});
```

### Change Password

```tsx
await changePassword({
  current: 'current-password',
  password: 'new-password',
  confirm: 'new-password',
});
```

The SDK remaps the fields for the API (`current` → `password_current`, `password` → `password_1`, `confirm` → `password_2`) automatically.

It's one `POST my-account` with only the password fields; the rest of the account is left as it is. It returns the customer with `account_updated` in `result`. A wrong current password is a `ValidationError` (`cocart_account_incorrect_current_password`).

### Update Address

Saves the billing and/or shipping address. Fields are unprefixed:

```tsx
const address = { first_name: 'Jane', address_1: '1 Main St', city: 'Paris', postcode: '75001', country: 'FR' };
await updateAddress({ billing_address: address, shipping_address: address });
```

---

## Orders

### Get All Orders

```tsx
const response = await getOrders();

// With pagination, sorting and filters
const response = await getOrders({ page: 1, per_page: 10, order: 'DESC', status: ['processing', 'on-hold'] });

const { orders, pagination } = response.toObject();
orders[0].id;           // 1042
orders[0].number;       // '1042'
orders[0].status.code;  // 'completed' (use this in code)
orders[0].status.label; // 'Completed' (translated, for display)
orders[0].total;        // '6450' (minor units)
pagination.total_items; // also in the X-WP-Total header
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `number` | Page number |
| `per_page` | `number` | Orders per page |
| `order` | `string` | Sort direction (`ASC` / `DESC`) |
| `status` | `string \| string[]` | Only these statuses, e.g. `'processing'` or `['on-hold', 'completed']` |
| `after`, `before` | `string` | Only orders placed after/before this date (ISO 8601; without an offset it's UTC) |
| `subscription_order_type` | `string` | `parent`, `renewal`, `switch` or `resubscribe` |
| `formatted` | `boolean` | Amounts formatted for display (`'$64.50'`) instead of minor units |
| `meta_keys` | `string[]` | Only these keys in each order's `meta` |

### Get Single Order

```tsx
const response = await getOrder(123);
const order = response.toObject();
console.log(order.id, order.status.code);
console.log(order.total_lines);           // [{ key, label, amount, detail }], in display order
console.log(order.payment.needs_payment); // true while it can still be paid
console.log(order.downloads);             // the files this order can download
console.log(order.allowed_actions);       // e.g. ['pay', 'cancel']
```

Someone else's order, or one that doesn't exist, is `404 cocart_order_not_found`.

### Get Guest Order

Retrieve an order for an unauthenticated customer by order ID and billing email. The order comes without its `key`, and look-ups are rate limited (`429 cocart_guest_lookup_rate_limited`):

```tsx
const response = await getGuestOrder(123, 'customer@example.com');
```

### Cancel an Order

Cancels one of the customer's orders where WooCommerce allows it (for example a pending or failed order):

```tsx
const response = await cancelOrder(123);
response.get('status.code'); // 'cancelled'
```

An order that can't be cancelled is `409 cocart_order_cannot_be_cancelled`.

---

## Downloads

### Get Downloads for an Order

The files one order can download (`GET my-account/orders/{id}/downloads`):

```tsx
const response = await getOrderDownloads(123);
const downloads = response.toObject(); // AccountDownload[]
```

### Get Downloads for a Guest Order

```tsx
const response = await getGuestOrderDownloads(123, 'customer@example.com');
const downloads = response.toObject();
```

### Get All Downloads

Returns all digital downloads available to the authenticated customer:

```tsx
const response = await getDownloads();
const downloads = response.toObject();

downloads[0].name;                // 'my-ebook-v2.pdf'
downloads[0].downloads_remaining; // 3, or null when unlimited
downloads[0].href;                // the link that downloads the file
```

---

## Reviews

Returns all product reviews written by the authenticated customer (`GET products/reviews/mine`, the same as `products().myReviews()`):

```tsx
const response = await getReviews();
const reviews = response.toObject() as any[];
```

---

## Email Verification

> Requires CoCart Plus.

```tsx
// Confirm a pending email change, with the key and user ID from the emailed link.
await verifyEmail(key, userId);

// Prove ownership of the account email so WooCommerce links past guest orders to it (WooCommerce 11+).
const sent = await sendOrderEmailVerification();
sent.get('result.code'); // 'verification_sent', or 'verification_throttled' with retry_after (seconds)
await verifyOrderEmail(key, userId);
```

---

## Subscriptions

> Requires CoCart Plus and WooCommerce Subscriptions.

```tsx
const list = await getSubscriptions({ page: 1, per_page: 10, status: 'active' });
const { subscriptions, pagination } = list.toObject();
const one = await getSubscription(512);

await suspendSubscription(512);
await reactivateSubscription(512);
await cancelSubscription(512);
await setSubscriptionAutoRenew(512, false);

// Resubscribe puts the ended subscription's items in the cart; check out as usual, or undo it.
await resubscribe(512);
await cancelResubscribe(512);
```

Each change returns the subscription with what happened in `result`. A change the subscription's state refuses is a `409` (e.g. `cocart_subscription_cannot_suspend`).

---

## Changing a Subscription's Payment Method

> Requires WooCommerce Subscriptions. The customer must be logged in.

A subscription can switch to a card the customer has saved, or to a new one. Use a gateway that can charge renewals: a saved card's `supportsSubscriptions`, or a method's `supports.subscriptions`, in `usePaymentMethods()`.

`updateSubscriptionPaymentMethod()` can take payment like checkout, so it returns the same [`CheckoutResult`](checkout.md#reading-the-result). A new card may need 3D Secure.

**With a saved card:**

```tsx
const { savedCards } = usePaymentMethods();
const { updateSubscriptionPaymentMethod } = useAccount();

const renewalCards = savedCards.filter((card) => card.supportsSubscriptions);

const result = await updateSubscriptionPaymentMethod(512, {
  payment_method: card.gatewayId,
  token_id: card.id,
});
```

**With a new card**, create a payment method as in the [Quick Start](checkout.md#quick-start):

```tsx
const { paymentMethod } = await createPaymentMethod({ paymentMethodType: 'Card' });

const result = await updateSubscriptionPaymentMethod(512, {
  payment_method: 'stripe',
  payment_data: { 'wc-stripe-payment-method': paymentMethod.id },
});
```

The new card is saved to the customer's account, since the renewals charge it.

**Reading the result:**

```tsx
if (result.isComplete) {
  // code 'payment_method_changed'; result.message says which method it now renews with.
  result.subscriptionId;                     // 512
  result.response.get('payment.title');      // 'Visa ending in 4242'
  result.response.get('payment.auto_renew'); // true: it renews automatically again
} else if (result.needsConfirmation) {
  await confirmCard(result); // then call updateSubscriptionPaymentMethod() again with the same input
} else if (result.needsRedirect) {
  await Linking.openURL(result.redirectUrl!); // then confirmReturn() when the app reopens
} else if (result.isPending) {
  // Not confirmed yet: getSubscription(512) shows the new method once it is.
} else {
  Alert.alert('Card not changed', result.message);
}
```

Confirm as in [3D Secure in the App](checkout.md#3d-secure-in-the-app); a new card usually gives a SetupIntent (`result.intentType` is `'setup_intent'`). After an off-site step, `confirmReturn()` returns the subscription (`result.object` is `'subscription'`), and `getSubscription(512)` shows the new method.

| Code | HTTP | Meaning |
|---|---|---|
| `cocart_subscription_not_found` | 404 | No such subscription for this customer |
| `cocart_subscription_payment_method_change_unsupported` | 400 | The subscription's payment method can't be changed |
| `cocart_subscription_cannot_change_payment_method` | 409 | The subscription's state doesn't allow it now |
| `cocart_subscription_payment_token_required` | 400 | Pass a saved card's `token_id`, or a new card in `payment_data` |
| `cocart_invalid_payment_method` | 400 | The payment method isn't usable for this |
| `cocart_subscription_payment_token_needs_confirmation` | 400 | The saved card must be confirmed before it can pay renewals |
| `cocart_payment_in_progress` | 409 | Another change is still taking payment for this subscription: check it before trying again |

A declined card isn't an error: it comes back as a failed result (`payment_failed`), as at checkout.

---

## Order Withdrawal

> Requires CoCart Plus.

Submits a right-of-withdrawal request. No login needed; the response is the same whether or not the order matched:

```tsx
await requestOrderWithdrawal({
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  email_confirmation: 'jane@example.com',
  order_number: '1042',
  withdrawal_type: 'full_order', // or 'specific_items_only' with additional_details
});
```

---

## Full Example: Account Screen

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useAccount, CoCartError } from '@cocartheadless/react-native-sdk';

export function AccountScreen() {
  const { getProfile, getOrders } = useAccount();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          getProfile(),
          getOrders({ per_page: 5 }),
        ]);
        setProfile(profileRes.toObject());
        setOrders(ordersRes.toObject().orders ?? []);
      } catch (e) {
        if (e instanceof CoCartError) {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getProfile, getOrders]);

  if (loading) return <ActivityIndicator />;
  if (error)   return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>Welcome, {profile?.display_name}</Text>
      <Text>Recent Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Text>Order #{item.number} — {item.status.label}</Text>
        )}
      />
    </View>
  );
}
```

---

## Error Handling

All account methods throw `CoCartError` (or a subclass) on failure. The most common scenario is calling account methods without being authenticated:

```tsx
import { useAccount, AuthenticationError, CoCartError } from '@cocartheadless/react-native-sdk';

async function loadProfile() {
  try {
    const response = await getProfile();
  } catch (e) {
    if (e instanceof AuthenticationError) {
      // Redirect to login
    } else if (e instanceof CoCartError) {
      // e.errorCode === 'cocart_plugin_required' if the plugin isn't installed
      console.log(e.message);
    }
  }
}
```

See [Error Handling](error-handling.md) for the full error hierarchy.
