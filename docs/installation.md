# Configuration & Setup

For installation instructions and requirements, see the [README](../README.md#installation).

## Provider Options

The `CoCartProvider` accepts a `options` prop that maps directly to `CoCartOptions` from `@cocartheadless/sdk`. You only need to include the ones relevant to your setup — everything has sensible defaults.

```tsx
import { CoCartProvider, MMKVStorage } from '@cocart/react-native-sdk';

<CoCartProvider
  siteURL="https://your-store.com"
  options={{
    // Storage — persist cart key and JWT tokens across app restarts
    storage: new MMKVStorage(),
    storageKey: 'cocart_cart_key',     // default: 'cocart_cart_key'

    // Guest session — resume an existing cart
    cartKey: 'existing_cart_key',

    // Basic Auth
    username: 'customer@email.com',
    password: 'password',

    // JWT Auth
    jwtToken: 'your-jwt-token',
    jwtRefreshToken: 'your-refresh-token',

    // HTTP settings
    timeout: 30000,         // milliseconds (default: 30000)
    maxRetries: 2,          // retry 429, 503, and timeouts

    // REST API prefix (default: 'wp-json')
    restPrefix: 'wp-json',

    // API namespace (default: 'cocart')
    namespace: 'cocart',

    // CoCart main plugin: 'basic' (default) or 'legacy'
    mainPlugin: 'basic',

    // Custom auth header name (default: 'Authorization')
    authHeaderName: 'X-Auth-Token',

    // Enable debug logging to console (default: false)
    debug: true,
  }}
  autoRestoreSession={true}  // default: true — restore cart key on mount and foreground
>
  <App />
</CoCartProvider>
```

## Storage Adapters

Storage adapters control where the cart key (guest session) and JWT tokens are persisted. Without a storage adapter, sessions are kept in memory only and lost on app restart.

### MMKVStorage (recommended)

[`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv) is a synchronous, high-performance storage library backed by MMKV (used in the WeChat app). It is the fastest option and works on both iOS and Android. Requires a native build — not compatible with Expo managed workflow unless using a custom dev client.

```bash
npm install react-native-mmkv
cd ios && pod install
```

```tsx
import { MMKVStorage } from '@cocart/react-native-sdk';

<CoCartProvider siteURL="..." options={{ storage: new MMKVStorage() }}>
```

By default, data is stored in an MMKV instance with the ID `cocart`. To isolate multiple stores:

```tsx
new MMKVStorage('my-store-id')
```

### AsyncStorageAdapter

[`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) is an asynchronous key-value store. It is the standard storage solution for Expo managed workflow and plain React Native projects.

```bash
npm install @react-native-async-storage/async-storage
```

```tsx
import { AsyncStorageAdapter } from '@cocart/react-native-sdk';

<CoCartProvider siteURL="..." options={{ storage: new AsyncStorageAdapter() }}>
```

All keys are prefixed with `cocart_` by default to avoid collisions. To use a custom prefix:

```tsx
new AsyncStorageAdapter('myapp_')
```

### MemoryStorage (no persistence)

For testing or when you intentionally do not want session persistence:

```tsx
import { MemoryStorage } from '@cocart/react-native-sdk';

<CoCartProvider siteURL="..." options={{ storage: new MemoryStorage() }}>
```

### Custom Storage

Implement `StorageInterface` from `@cocartheadless/sdk` to use any storage backend:

```tsx
import type { StorageInterface } from '@cocart/react-native-sdk';

class SecureStorage implements StorageInterface {
  async get(key: string) {
    return SecureStore.getItemAsync(key);
  }
  async set(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  }
  async delete(key: string) {
    await SecureStore.deleteItemAsync(key);
  }
}
```

## Session Restore

`CoCartProvider` calls `client.restoreSession()` automatically:

- **On mount** — restores the cart key from storage so the first request sends the correct guest session
- **On foreground** — when the app returns from background (`AppState === 'active'`), the session is restored again in case storage was updated elsewhere

To disable automatic restore:

```tsx
<CoCartProvider siteURL="..." autoRestoreSession={false}>
```

You can then call it manually:

```tsx
import { useCoCart } from '@cocart/react-native-sdk';

const client = useCoCart();
await client.restoreSession();
```

## White-Labelling / Custom REST Prefix

WordPress exposes its REST API at `/wp-json/` by default. If your site changes this prefix, or if the CoCart plugin has been renamed (white-labelled):

```tsx
// Custom REST prefix (site uses /api/ instead of /wp-json/)
<CoCartProvider
  siteURL="https://your-store.com"
  options={{ restPrefix: 'api' }}
>
// Requests go to: https://your-store.com/api/cocart/v2/cart

// White-labelled namespace
<CoCartProvider
  siteURL="https://your-store.com"
  options={{ namespace: 'mystore' }}
>
// Requests go to: https://your-store.com/wp-json/mystore/v2/cart
```

## Legacy Plugin Support

To use the SDK with the legacy CoCart plugin (`cart-rest-api-for-woocommerce` v4.x):

```tsx
<CoCartProvider
  siteURL="https://your-store.com"
  options={{ mainPlugin: 'legacy' }}
>
```

Methods that require CoCart Basic will throw a `VersionError` before making any HTTP request. See [Error Handling](error-handling.md#legacy-plugin-version-guard) for details.

## Direct Client Access

Outside of the provider pattern, you can construct and use the client directly for one-off operations:

```tsx
import { CoCart, MMKVStorage } from '@cocart/react-native-sdk';

const client = new CoCart('https://your-store.com', {
  storage: new MMKVStorage(),
});

await client.restoreSession();
const products = await client.products().all();
```
