# Error Handling

When something goes wrong — a product doesn't exist, the customer isn't authenticated, or the network fails — the SDK throws an error. All error classes are re-exported from this package so you can import them directly.

## Error Hierarchy

```text
CoCartError (base)                    — any API error
├── AuthenticationError               — login/permission problems (401, 403)
│   └── TwoFactorAuthRequiredError    — 2FA code required to complete login (401)
├── ValidationError                   — bad input (400)
└── VersionError                      — method requires CoCart Starter (legacy mode)
```

All errors extend `CoCartError`, which extends JavaScript's built-in `Error`. Use `instanceof` to check what kind of error was caught.

## Catching Errors

```tsx
import {
  CoCartError,
  AuthenticationError,
  TwoFactorAuthRequiredError,
  ValidationError,
  VersionError,
} from '@cocartheadless/react-native-sdk';

try {
  await client.cart().addItem(999, 1);
} catch (e) {
  if (e instanceof TwoFactorAuthRequiredError) {
    // 2FA required — show code input UI
    // e.availableProviders, e.defaultProvider, e.emailSent
  } else if (e instanceof ValidationError) {
    // 400 — product not found, out of stock, invalid quantity
    console.log('Validation:', e.message, e.errorCode);
  } else if (e instanceof AuthenticationError) {
    // 401 or 403 — invalid credentials, expired token
    console.log('Auth error:', e.message, e.httpCode);
  } else if (e instanceof CoCartError) {
    // Any other API error (404, 500, etc.)
    console.log('API error:', e.message, e.httpCode);
  } else {
    throw e; // unknown error — rethrow
  }
}
```

## Error Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error message from the API |
| `errorCode` | `string \| null` | API error code (e.g. `cocart_product_not_found`) |
| `httpCode` | `number` | HTTP status code (400, 401, 403, 500, etc.) |
| `responseData` | `Record<string, unknown>` | Full API response body for debugging |

`getCart()` returns the cart sent with an error, or `null` (see [Item No Longer in the Cart](#item-no-longer-in-the-cart)).

Error messages name the method and route (`POST /cocart/v2/cart/add-item: …`), never the full URL, so a guest's cart key or API credentials in the query string don't end up in your logs or crash reports.

## Error Handling in Hooks

The `useCart` and `useProducts` hooks capture errors automatically and expose them via the `error` property:

```tsx
function CartScreen() {
  const { cart, loading, error } = useCart();

  if (loading) return <ActivityIndicator />;

  if (error) {
    if (error instanceof AuthenticationError) {
      return <Text>Please log in to view your cart.</Text>;
    }
    return <Text>Something went wrong: {error.message}</Text>;
  }

  return <CartView cart={cart} />;
}
```

For mutations, errors are thrown and must be caught in the calling code:

```tsx
function AddToCartButton({ productId }: { productId: number }) {
  const { addItem } = useCartMutations();
  const [error, setError] = React.useState<string | null>(null);

  async function handlePress() {
    try {
      setError(null);
      await addItem(productId, 1);
    } catch (e) {
      if (e instanceof CoCartError) {
        setError(e.message);
      }
    }
  }

  return (
    <>
      <Button title="Add to Cart" onPress={handlePress} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </>
  );
}
```

## HTTP Status Code Mapping

| HTTP Status | Error Thrown | Typical Causes |
|-------------|-------------|----------------|
| 400 | `ValidationError` | Invalid product ID, out of stock, invalid quantity |
| 401 | `AuthenticationError` | Missing or invalid credentials |
| 401 | `TwoFactorAuthRequiredError` | Login succeeded but 2FA code is required |
| 403 | `AuthenticationError` | Expired JWT token, insufficient permissions |
| 404 | `CoCartError` | Endpoint not found, item key not found |
| 500 | `CoCartError` | Server error |

## Two Factor Authentication Required

When a customer with 2FA enabled logs in, `client.login()` throws `TwoFactorAuthRequiredError`. Check for it before the broader `AuthenticationError`:

```tsx
import { TwoFactorAuthRequiredError, AuthenticationError } from '@cocartheadless/react-native-sdk';

try {
  await client.login('customer@email.com', 'password');
} catch (e) {
  if (e instanceof TwoFactorAuthRequiredError) {
    // Show 2FA code input
    console.log('Available providers:', e.availableProviders);
    console.log('Default:', e.defaultProvider);
    console.log('Email sent:', e.emailSent);
  } else if (e instanceof AuthenticationError) {
    // Wrong password, missing plugin, etc.
    console.log('Auth failed:', e.message);
  }
}
```

See [Authentication](authentication.md#two-factor-authentication) for the full flow.

## Client-Side Validation Errors

The SDK validates certain inputs before making a network request and throws a `ValidationError` immediately with no HTTP call:

```tsx
try {
  await addItem(-1, 0);
} catch (e) {
  if (e instanceof ValidationError) {
    // e.message  => "Product ID must be a positive integer"
    // e.httpCode => 0 (no HTTP request was made)
  }
}
```

| Method | Check | Message |
|--------|-------|---------|
| `addItem(id, qty)` | `id` must be a positive integer | "Product ID must be a positive integer" |
| `addItem(id, qty)` | `qty` must be a positive number | "Quantity must be a positive number" |
| `updateItem(key, qty)` | `qty` must be a positive number | "Quantity must be a positive number" |

## Legacy Plugin Version Guard

When using the SDK with `mainPlugin: 'legacy'`, methods that require CoCart Starter throw a `VersionError` before making any network request:

```tsx
import { VersionError } from '@cocartheadless/react-native-sdk';

const client = new CoCart('https://your-store.com', { mainPlugin: 'legacy' });

try {
  await client.products().findBySlug('blue-hoodie');
} catch (e) {
  if (e instanceof VersionError) {
    // e.message   => "products()->findBySlug() requires CoCart Starter..."
    // e.errorCode => 'cocart_version_required'
    // e.httpCode  => 0 (no HTTP request was made)
  }
}
```

## CoCart Plugin Required

When calling methods that require a CoCart extension that isn't installed:

```tsx
try {
  await client.cart().applyCoupon('SAVE10');
} catch (e) {
  if (e instanceof CoCartError) {
    // e.errorCode => 'cocart_plugin_required'
  }
}
```

## Expired Cart Key

CoCart Starter 5 refuses a cart key with no cart session on every cart route (`404 cocart_invalid_cart`), for example after the cart expired. The client then forgets the stored key and retries the request once as a new guest, so this error doesn't reach your code for a guest; a fresh cart key comes back as usual.

## Item No Longer in the Cart

Getting, updating or removing an item whose key isn't in the cart (for example, another device already removed it) fails with `404 cocart_item_not_in_cart`. Since CoCart Starter 5 the error carries the cart as it is now, so you can show it without fetching the cart again:

```tsx
try {
  await updateItem(itemKey, 2);
} catch (e) {
  if (e instanceof CoCartError && e.errorCode === 'cocart_item_not_in_cart') {
    const cart = e.getCart(); // the current cart, or null with CoCart 4.x
  }
}
```

## Quantity Reduced to the Maximum

Adding more than the purchase limit or the stock allows isn't an error: CoCart adds the maximum and says so with a notice.

```tsx
const response = await addItem(123, 50);
const notices = response.getNotices().notice ?? []; // ['The quantity of "Beanie" was reduced to 5, the most allowed in the cart.']
```

## Rate Limits

With rate limiting on (CoCart Plus), every response carries `RateLimit-*` headers:

```tsx
const { limit, remaining, reset, retryAfter } = response.getRateLimit();
```

Exceeding the limit returns 429 `rate_limit_exceeded`, which the client retries when `maxRetries` is set.

## Network / Timeout Errors

```tsx
const client = new CoCart('https://your-store.com', {
  timeout: 10000, // 10 seconds
});

try {
  await client.cart().get();
} catch (e) {
  if (e instanceof Error && e.name === 'AbortError') {
    console.log('Request timed out');
  }
}
```

## JWT Token Expiry

```tsx
const jwt = client.jwt();

// Proactive check
if (jwt.isTokenExpired()) {
  await jwt.refresh();
}

// Handle in catch
try {
  await client.cart().get();
} catch (e) {
  if (e instanceof AuthenticationError && jwt.hasTokens()) {
    await jwt.refresh();
    const cart = await client.cart().get(); // retry
  } else {
    throw e;
  }
}

// Or use automatic refresh
const result = await client.jwt().withAutoRefresh(async (c) => {
  return c.cart().get();
});
```

## Inspecting the Full API Response

Every error carries the full API response body:

```tsx
try {
  await client.cart().addItem(999, 1);
} catch (e) {
  if (e instanceof CoCartError) {
    console.log(e.responseData);
    // { code: 'cocart_product_not_found', message: '...', data: { ... } }
  }
}
```
