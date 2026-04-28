# @cocart/react-native-sdk

[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue?style=for-the-badge&labelColor=000000)](https://reactnative.dev/)
[![npm version](https://img.shields.io/npm/v/@cocart/react-native-sdk?style=for-the-badge&labelColor=000000)](https://www.npmjs.com/package/@cocart/react-native-sdk)
[![Tests](https://img.shields.io/github/actions/workflow/status/cocart-headless/cocart-react-native-sdk/tests.yml?label=tests&style=for-the-badge&labelColor=000000)](https://github.com/cocart-headless/cocart-react-native-sdk/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/cocart-headless/cocart-react-native-sdk?color=9cf&style=for-the-badge&labelColor=000000)](https://github.com/cocart-headless/cocart-react-native-sdk/blob/main/LICENSE)

Official React Native SDK for the [CoCart](https://cocartapi.com) REST API. Build headless WooCommerce storefronts in React Native using simple hooks.

> [!NOTE]
This SDK is a **thin wrapper** over [`@cocartheadless/sdk`](https://www.npmjs.com/package/@cocartheadless/sdk). It does not provide pre-built UI screens or native components — it provides state and data via hooks that you wire into your own screens using standard React Native primitives.

> [!IMPORTANT]
> This SDK is still in development and not yet ready for production use. Provide feedback if you experience a bug.

## TODO to complete the SDK

- [ ] Add SDK docs to documentation site
- [ ] Add support for Cart API extras
- [ ] Add Checkout API support

---

## How It Works

It adds three things on top of the core SDK:

- **Storage adapters** — `MMKVStorage` and `AsyncStorageAdapter` so cart sessions and tokens persist across app restarts
- **`CoCartProvider`** — constructs the client, restores the session on mount and on app foreground
- **Hooks** — `useCart`, `useCartMutations`, `useProducts`, `useAccount` for idiomatic React Native usage

All core logic (authentication, cart, products, sessions, JWT, 2FA, account, error handling) is inherited from the TypeScript SDK automatically.

---

## Requirements

- **React Native 0.72+** or **Expo SDK 50+**
- **React 18+**
- **CoCart plugin** installed on your WooCommerce store
- [`@cocartheadless/sdk`](https://www.npmjs.com/package/@cocartheadless/sdk) ^1.0.0 (peer dependency)
- [CoCart JWT Authentication](https://wordpress.org/plugins/cocart-jwt-authentication/) plugin (optional, for JWT auth)

## Support Policy

See [SUPPORT.md](SUPPORT.md) for our versioning policy and support lifecycle.

---

## Installation

```bash
npm install @cocart/react-native-sdk @cocartheadless/sdk
```

### Optional: Native Storage

For persistent cart sessions (recommended):

**MMKV** (fast synchronous storage — requires native build):

```bash
npm install react-native-mmkv
cd ios && pod install
```

**AsyncStorage** (async, Expo managed workflow compatible):

```bash
npm install @react-native-async-storage/async-storage
```

If neither is installed, sessions are kept in memory only and lost on app restart.

---

## Quick Start

Wrap your app in `CoCartProvider`, then use hooks in any component:

```tsx
import React from 'react';
import { CoCartProvider, MMKVStorage } from '@cocart/react-native-sdk';
import { StorefrontScreen } from './screens/StorefrontScreen';

export default function App() {
  return (
    <CoCartProvider
      siteURL="https://your-store.com"
      options={{ storage: new MMKVStorage() }}
    >
      <StorefrontScreen />
    </CoCartProvider>
  );
}
```

```tsx
import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useCart, useCartMutations, useProducts } from '@cocart/react-native-sdk';

export function StorefrontScreen() {
  const { products, loading: productsLoading } = useProducts();
  const { cart, loading: cartLoading } = useCart();
  const { addItem } = useCartMutations();

  if (productsLoading || cartLoading) return <Text>Loading...</Text>;

  return (
    <View>
      <FlatList
        data={products?.toObject() as any[]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Button title="Add to Cart" onPress={() => addItem(item.id, 1)} />
          </View>
        )}
      />
      <Text>Cart items: {cart?.getItemCount() ?? 0}</Text>
    </View>
  );
}
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Configuration & Setup](docs/installation.md) | Provider options, storage adapters, session restore |
| [Authentication](docs/authentication.md) | Guest, Basic Auth, JWT, 2FA |
| [Cart API](docs/cart.md) | Add, update, remove items, coupons, shipping |
| [Products API](docs/products.md) | Browse, filter, categories, tags |
| [Account API](docs/account.md) | Profile, orders, downloads, reviews |
| [Error Handling](docs/error-handling.md) | Error hierarchy, catching errors, 2FA flow |
| [Hooks Reference](docs/hooks.md) | useCart, useCartMutations, useProducts, useAccount, useCoCart |
| [Utilities](docs/utilities.md) | Currency formatter, timezone helper |

---

## CoCart Channels

- **Documentation** — [https://cocartapi.com/docs](https://cocartapi.com/docs)
- **Community** — [https://cocartapi.com/community](https://cocartapi.com/community)
- **GitHub** — [https://github.com/cocart-headless](https://github.com/cocart-headless)
- **X** — [@cocartheadless](https://twitter.com/cocartheadless)

## Credits

CoCart is developed and maintained by [CoCart Headless, LLC](https://cocartapi.com).

## License

Released under the [MIT License](LICENSE).
