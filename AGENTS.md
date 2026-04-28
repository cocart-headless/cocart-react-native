@CLAUDE.md

# CoCart React Native SDK

Official React Native SDK for the CoCart REST API. Thin wrapper over `@cocartheadless/sdk` — provides React Native storage adapters, a React Context provider, and React hooks.

- **Package:** `@cocart/react-native-sdk`
- **Version:** 1.0.0
- **Distribution:** npm
- **Requires:** React Native 0.72+, React 18+
- **License:** MIT

---

## Commands

```bash
npm install                                              # install dependencies
npm test                                                 # run all tests
npm test -- --testPathPattern="storage"                  # run tests matching a path
npm test -- -t "stores and retrieves"                    # run tests matching a name
npm run typecheck                                        # tsc --noEmit
npm run build                                            # compile via react-native-builder-bob
```

---

## Tech Stack

| | |
|---|---|
| Language | TypeScript 5.4 — strict mode |
| Runtime | React Native 0.72+ |
| Tests | Jest 29 + @testing-library/react-native |
| Build | react-native-builder-bob |
| Core dependency | `@cocartheadless/sdk` (peer) |
| Storage (optional) | `react-native-mmkv` (fast sync), `@react-native-async-storage/async-storage` (async) |

---

## Project Structure

```
src/
  index.ts                         # barrel export (public API)
  storage/
    MMKVStorage.ts                 # react-native-mmkv adapter
    AsyncStorageAdapter.ts         # @react-native-async-storage adapter
  provider/
    CoCartContext.ts               # React Context definition
    CoCartProvider.tsx             # Provider: constructs client, restores session, handles AppState
  hooks/
    useCoCart.ts                   # Access the CoCart client instance
    useCart.ts                     # Cart state with auto-fetch
    useCartMutations.ts            # addItem / removeItem / updateItem / clear
    useProducts.ts                 # Products listing with category/tag/filter support
__tests__/
  storage/
    MMKVStorage.test.ts
    AsyncStorageAdapter.test.ts
  hooks/
    useCart.test.tsx
    useCartMutations.test.tsx
    useProducts.test.tsx
  provider/
    CoCartProvider.test.tsx
__mocks__/
  react-native-mmkv.ts             # in-memory mock for MMKV
  @react-native-async-storage/
    async-storage.ts               # jest.fn() mock for AsyncStorage
  @cocartheadless/
    sdk.ts                         # mock CoCart class + resource stubs for hook tests
```

---

## Architecture

This SDK **does not reimplement any core CoCart logic**. All HTTP, auth, cart, products, sessions, JWT, and error handling comes from `@cocartheadless/sdk`. This SDK adds:

1. **Storage adapters** — `MMKVStorage` (synchronous, fast) and `AsyncStorageAdapter` (async, Expo-compatible). Both implement `StorageInterface` from the core SDK.
2. **`CoCartProvider`** — instantiates the `CoCart` client, calls `restoreSession()` on mount and on `AppState` foreground transitions.
3. **Hooks** — `useCoCart`, `useCart`, `useCartMutations`, `useProducts` wrap the core SDK resources in React state.

Feature parity (2FA, account resource, etc.) is automatic via the core SDK peer dependency.

---

## Code Style

- **File names:** `PascalCase.ts` / `PascalCase.tsx` for classes; `camelCase.ts` for hooks
- **Classes / Types / Interfaces:** `PascalCase`
- **Functions, methods, variables:** `camelCase`
- No ESLint config — tsc strict mode is the quality gate
- Named exports throughout; all public API re-exported from `src/index.ts`

---

## Git

- **Commit style:** Imperative, capital first letter — `Add X`, `Fix X`
- **Co-author footer:** `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Testing

| | |
|---|---|
| Framework | Jest 29 + @testing-library/react-native |
| Location | `__tests__/` (mirrors `src/` structure) |
| File pattern | `*.test.{ts,tsx}` |
| Mocking strategy | `@cocartheadless/sdk` is fully mocked via `__mocks__/@cocartheadless/sdk.ts`; MMKV and AsyncStorage are mocked via `__mocks__/` |

- Hook tests render inside a `<CoCartProvider>` wrapper via `renderHook`
- Storage tests operate against the in-memory mocks — no native modules required
- All tests run in Node (no device/simulator needed)

---

## Adding a New Hook

1. Create `src/hooks/useMyHook.ts`
2. Call `useCoCart()` to get the client
3. Export from `src/index.ts`
4. Add a test in `__tests__/hooks/useMyHook.test.tsx`
