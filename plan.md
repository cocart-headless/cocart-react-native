# CoCart React Native SDK — Developer Plan

> Based on the actual `@cocartheadless/sdk` TypeScript SDK (`cocart-headless/cocart-js`), adapted to React Native conventions. Wraps the core TS SDK logic with React Native-specific storage and provides React hooks for idiomatic usage.

---

## 1. Overview

| Item | Detail |
|---|---|
| Package name | `@cocart/react-native-sdk` |
| Language | TypeScript |
| Min React Native | 0.72+ (New Architecture compatible) |
| Distribution | npm |
| HTTP | `fetch` (React Native built-in, same as TS SDK) |
| Storage | `react-native-mmkv` (default, fast), fallback `@react-native-async-storage/async-storage` |
| Auth | Guest (cart key), Basic Auth, JWT with auto-refresh, Consumer Keys |

### Strategy: Thin Wrapper Over TS SDK

The React Native SDK should **not** reimplement the core logic. Instead:
- Import the core `CoCart` class from `@cocartheadless/sdk` (the existing TS SDK)
- Provide React Native-specific `CoCartStorage` implementations (MMKV, AsyncStorage)
- Provide React Context + hooks (`useCart`, `useCoCart`, `useProducts`) for idiomatic React Native usage
- Handle React Native-specific concerns (app state, background/foreground transitions)

This keeps the SDK thin, avoids duplication, and ensures feature parity automatically.

---

## 2. What the TS SDK Already Provides (No Reimplementation Needed)

All core logic is inherited from `@cocartheadless/sdk`:

- Client construction with options
- Authentication modes (JWT, Basic Auth, Consumer Keys, Guest)
- Guest session management (cart key capture from `Cart-Key` and `CoCart-API-Cart-Key` headers)
- Cart, Products, Sessions, JWT resources with all methods
- **Account resource** (`client.account()`) — profile, orders, downloads, reviews (see §2.1)
- **Two Factor Authentication** — `TwoFactorAuthRequiredError` thrown on `cocart_2fa_required`; `client.jwt().verifyTwoFactor()` completes login (see §2.2)
- Response object with dot-notation `.get()`
- Input validation (productId, quantity, email)
- ETag / conditional requests
- Event system
- Legacy plugin mode
- Currency formatter
- Retry logic, error handling

### 2.1 Account Resource (inherited)

`client.account()` exposes customer account management via `cocart/v2/my-account`. All methods are immediately available with no additional implementation:

| Method | HTTP | Path |
|--------|------|------|
| `getProfile()` | GET | `cocart/v2/my-account` |
| `updateProfile(data)` | POST | `cocart/v2/my-account` |
| `changePassword({ current, password, confirm })` | POST | `cocart/v2/my-account/change-password` |
| `getOrders(params?)` | GET | `cocart/v2/my-account/orders` |
| `getOrder(id)` | GET | `cocart/v2/my-account/orders/{id}` |
| `getGuestOrder(id, email)` | GET | `cocart/v2/my-account/orders/{id}?email=` |
| `getOrderDownloads(id)` | GET | `cocart/v2/my-account/orders/{id}/downloads` |
| `getGuestOrderDownloads(id, email)` | GET | `cocart/v2/my-account/orders/{id}/downloads?email=` |
| `getDownloads()` | GET | `cocart/v2/my-account/downloads` |
| `getReviews()` | GET | `cocart/v2/my-account/reviews` |

The `index.ts` barrel should re-export the `Account`-related types from the TS SDK once they are exported there.

### 2.2 Two Factor Authentication (inherited)

When the WooCommerce store requires 2FA, `client.jwt().login()` throws `TwoFactorAuthRequiredError` instead of resolving. The caller catches it and prompts the user for their code, then calls `client.jwt().verifyTwoFactor()`:

```typescript
import { TwoFactorAuthRequiredError } from '@cocartheadless/sdk';

try {
    await client.jwt().login(username, password);
} catch (e) {
    if (e instanceof TwoFactorAuthRequiredError) {
        // e.availableProviders — string[] of provider slugs
        // e.defaultProvider   — string | undefined
        // e.emailSent         — boolean
        const code = await promptUserFor2FACode();
        await client.jwt().verifyTwoFactor(username, password, code, e.defaultProvider);
    }
}
```

The `index.ts` barrel must re-export `TwoFactorAuthRequiredError` from the TS SDK so RN consumers can import it directly from `@cocart/react-native-sdk`.

---

## 3. What the React Native SDK Adds

### 3.1 Native Storage Adapters

```typescript
// MMKV storage (recommended — synchronous, fast)
import { MMKVStorage } from '@cocart/react-native-sdk';

const client = new CoCart('https://your-store.com', {
    storage: new MMKVStorage(),
});

// AsyncStorage fallback (slower, async)
import { AsyncStorageAdapter } from '@cocart/react-native-sdk';

const client = new CoCart('https://your-store.com', {
    storage: new AsyncStorageAdapter(),
});
```

### 3.2 React Context Provider

```tsx
import { CoCartProvider } from '@cocart/react-native-sdk';

function App() {
    return (
        <CoCartProvider
            siteURL="https://your-store.com"
            options={{ storage: new MMKVStorage() }}
        >
            <MyApp />
        </CoCartProvider>
    );
}
```

### 3.3 React Hooks

```typescript
// Access the CoCart client instance
const client = useCoCart();

// Cart state with auto-fetch and caching
const { cart, loading, error, refresh } = useCart();

// Products with filters
const { products, loading, error } = useProducts({ category: 'shirts' });

// Cart mutations with optimistic updates
const { addItem, removeItem, updateItem, clear } = useCartMutations();
```

### 3.4 App State Handling

Automatically restore session when app returns from background:

```typescript
<CoCartProvider
    siteURL="https://your-store.com"
    options={{ storage: new MMKVStorage() }}
    autoRestoreSession={true}  // default: true
>
```

---

## 4. Directory Structure

```
cocart-react-native-sdk/
├── src/
│   ├── index.ts                               # Barrel export
│   ├── storage/
│   │   ├── MMKVStorage.ts                     # react-native-mmkv adapter
│   │   └── AsyncStorageAdapter.ts             # @react-native-async-storage adapter
│   ├── provider/
│   │   ├── CoCartProvider.tsx                  # React Context provider
│   │   └── CoCartContext.ts                   # Context definition
│   ├── hooks/
│   │   ├── useCoCart.ts                       # Access client instance
│   │   ├── useCart.ts                         # Cart state + auto-fetch
│   │   ├── useCartMutations.ts               # Add/remove/update/clear
│   │   └── useProducts.ts                    # Products listing
│   └── utils/
│       └── appState.ts                        # AppState listener for session restore
├── __tests__/
│   ├── storage/
│   │   ├── MMKVStorage.test.ts
│   │   └── AsyncStorageAdapter.test.ts
│   ├── hooks/
│   │   ├── useCart.test.tsx
│   │   └── useCartMutations.test.tsx
│   └── provider/
│       └── CoCartProvider.test.tsx
├── example/                                    # Example React Native app
│   ├── App.tsx
│   ├── screens/
│   │   ├── CartScreen.tsx
│   │   └── ProductsScreen.tsx
│   └── package.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── CHANGELOG.md
└── README.md
```

---

## 5. package.json

```json
{
    "name": "@cocart/react-native-sdk",
    "version": "1.0.0",
    "description": "Official CoCart SDK for React Native",
    "main": "lib/commonjs/index.js",
    "module": "lib/module/index.js",
    "types": "lib/typescript/index.d.ts",
    "react-native": "src/index.ts",
    "files": ["src", "lib"],
    "peerDependencies": {
        "react": ">=18.0.0",
        "react-native": ">=0.72.0",
        "@cocartheadless/sdk": "^1.0.0"
    },
    "peerDependenciesMeta": {
        "react-native-mmkv": { "optional": true },
        "@react-native-async-storage/async-storage": { "optional": true }
    },
    "dependencies": {},
    "devDependencies": {
        "@cocartheadless/sdk": "^1.0.0",
        "react": "^18.0.0",
        "react-native": "^0.74.0",
        "react-native-mmkv": "^3.0.0",
        "@react-native-async-storage/async-storage": "^2.0.0",
        "typescript": "^5.4.0",
        "react-native-builder-bob": "^0.30.0",
        "jest": "^29.0.0",
        "@testing-library/react-native": "^12.0.0"
    }
}
```

---

## 6. Storage Adapters

### MMKVStorage.ts

```typescript
import { MMKV } from 'react-native-mmkv';
import type { CoCartStorage } from '@cocartheadless/sdk';

export class MMKVStorage implements CoCartStorage {
    private mmkv: MMKV;

    constructor(id: string = 'cocart') {
        this.mmkv = new MMKV({ id });
    }

    get(key: string): string | null {
        return this.mmkv.getString(key) ?? null;
    }

    set(key: string, value: string): void {
        this.mmkv.set(key, value);
    }

    delete(key: string): void {
        this.mmkv.delete(key);
    }
}
```

### AsyncStorageAdapter.ts

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CoCartStorage } from '@cocartheadless/sdk';

export class AsyncStorageAdapter implements CoCartStorage {
    private prefix: string;

    constructor(prefix: string = 'cocart_') {
        this.prefix = prefix;
    }

    async get(key: string): Promise<string | null> {
        return AsyncStorage.getItem(this.prefix + key);
    }

    async set(key: string, value: string): Promise<void> {
        await AsyncStorage.setItem(this.prefix + key, value);
    }

    async delete(key: string): Promise<void> {
        await AsyncStorage.removeItem(this.prefix + key);
    }
}
```

---

## 7. React Context Provider

```tsx
import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { CoCart } from '@cocartheadless/sdk';
import type { CoCartOptions } from '@cocartheadless/sdk';

export interface CoCartContextValue {
    client: CoCart;
}

export const CoCartContext = createContext<CoCartContextValue | null>(null);

interface CoCartProviderProps {
    siteURL: string;
    options?: Partial<CoCartOptions>;
    autoRestoreSession?: boolean;
    children: React.ReactNode;
}

export function CoCartProvider({
    siteURL,
    options = {},
    autoRestoreSession = true,
    children,
}: CoCartProviderProps) {
    const client = useMemo(
        () => new CoCart(siteURL, options),
        [siteURL] // stable across re-renders
    );

    // Restore session on mount
    useEffect(() => {
        if (autoRestoreSession) {
            client.restoreSession();
        }
    }, [client, autoRestoreSession]);

    // Restore session when app comes to foreground
    useEffect(() => {
        if (!autoRestoreSession) return;
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                client.restoreSession();
            }
        });
        return () => sub.remove();
    }, [client, autoRestoreSession]);

    const value = useMemo(() => ({ client }), [client]);

    return (
        <CoCartContext.Provider value={value}>
            {children}
        </CoCartContext.Provider>
    );
}
```

---

## 8. Hooks

### useCoCart.ts

```typescript
import { useContext } from 'react';
import { CoCartContext } from '../provider/CoCartContext';

export function useCoCart() {
    const ctx = useContext(CoCartContext);
    if (!ctx) throw new Error('useCoCart must be used within <CoCartProvider>');
    return ctx.client;
}
```

### useCart.ts

```typescript
import { useCallback, useEffect, useState } from 'react';
import type { CoCartResponse } from '@cocartheadless/sdk';
import { useCoCart } from './useCoCart';

interface UseCartResult {
    cart: CoCartResponse | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export function useCart(): UseCartResult {
    const client = useCoCart();
    const [cart, setCart] = useState<CoCartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await client.cart().get();
            setCart(response);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
            setLoading(false);
        }
    }, [client]);

    useEffect(() => { refresh(); }, [refresh]);

    return { cart, loading, error, refresh };
}
```

### useCartMutations.ts

```typescript
import { useCallback } from 'react';
import { useCoCart } from './useCoCart';

export function useCartMutations() {
    const client = useCoCart();

    const addItem = useCallback(
        (productId: number, quantity: number, options?: Record<string, unknown>) =>
            client.cart().addItem(productId, quantity, options),
        [client]
    );

    const removeItem = useCallback(
        (itemKey: string) => client.cart().removeItem(itemKey),
        [client]
    );

    const updateItem = useCallback(
        (itemKey: string, quantity: number, options?: Record<string, unknown>) =>
            client.cart().updateItem(itemKey, quantity, options),
        [client]
    );

    const clear = useCallback(() => client.cart().clear(), [client]);

    return { addItem, removeItem, updateItem, clear };
}
```

### useProducts.ts

```typescript
import { useCallback, useEffect, useState } from 'react';
import type { CoCartResponse } from '@cocartheadless/sdk';
import { useCoCart } from './useCoCart';

interface UseProductsOptions {
    category?: string;
    tag?: string;
    filters?: Record<string, string>;
    autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
    const client = useCoCart();
    const [products, setProducts] = useState<CoCartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let response: CoCartResponse;
            if (options.category) {
                response = await client.products().category(options.category);
            } else if (options.tag) {
                response = await client.products().tag(options.tag);
            } else {
                response = await client.products().all(options.filters);
            }
            setProducts(response);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
            setLoading(false);
        }
    }, [client, options.category, options.tag]);

    useEffect(() => {
        if (options.autoFetch !== false) fetch();
    }, [fetch, options.autoFetch]);

    return { products, loading, error, refresh: fetch };
}
```

---

## 9. Barrel Export (`index.ts`)

```typescript
// Re-export everything from the core SDK
export { CoCart, CoCartResponse, CurrencyFormatter, TwoFactorAuthRequiredError } from '@cocartheadless/sdk';
export type { CoCartOptions, CoCartStorage } from '@cocartheadless/sdk';

// React Native storage adapters
export { MMKVStorage } from './storage/MMKVStorage';
export { AsyncStorageAdapter } from './storage/AsyncStorageAdapter';

// React Context + Hooks
export { CoCartProvider } from './provider/CoCartProvider';
export { useCoCart } from './hooks/useCoCart';
export { useCart } from './hooks/useCart';
export { useCartMutations } from './hooks/useCartMutations';
export { useProducts } from './hooks/useProducts';
```

---

## 10. React Native-Specific Considerations

- **No `localStorage`**: The TS SDK's default `MemoryStorage` works but doesn't persist. MMKV or AsyncStorage needed for persistence.
- **App state transitions**: Session restore on foreground return handled by provider.
- **Hermes**: All code must be Hermes-compatible (no `eval`, no dynamic `require`).
- **New Architecture**: Compatible with both old and new architecture (no native modules, pure JS/TS).
- **Bundle size**: Thin wrapper keeps the added size minimal (~5KB gzipped on top of the core SDK).
- **Expo**: Works with Expo (managed workflow requires `expo-build-properties` for MMKV native module, or use AsyncStorage which is Expo-compatible out of the box).

---

## 11. Implementation Order

1. `MMKVStorage` + `AsyncStorageAdapter`
2. `CoCartContext` + `CoCartProvider` (with app state handling)
3. `useCoCart` hook
4. `useCart` + `useCartMutations` hooks
5. `useProducts` hook
6. Barrel export (`index.ts`)
7. Unit tests (storage, hooks, provider)
8. Example app
9. `package.json` + build config (react-native-builder-bob)
10. Publishing config
