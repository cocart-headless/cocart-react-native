import { AsyncStorageAdapter } from '../../src/storage/AsyncStorageAdapter';

describe('AsyncStorageAdapter', () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
    jest.clearAllMocks();
  });

  test('returns null for missing key', async () => {
    expect(await adapter.get('missing')).toBeNull();
  });

  test('stores and retrieves a value', async () => {
    await adapter.set('cart_key', 'abc123');
    const value = await adapter.get('cart_key');
    expect(value).toBe('abc123');
  });

  test('deletes a value', async () => {
    await adapter.set('cart_key', 'abc123');
    await adapter.delete('cart_key');
    expect(await adapter.get('cart_key')).toBeNull();
  });

  test('prefixes keys with cocart_ by default', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await adapter.set('mykey', 'val');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cocart_mykey', 'val');
  });

  test('uses custom prefix when provided', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const custom = new AsyncStorageAdapter('store_');
    await custom.set('key', 'val');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('store_key', 'val');
  });
});
