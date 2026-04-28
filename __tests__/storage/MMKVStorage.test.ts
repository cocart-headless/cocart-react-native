import { MMKVStorage } from '../../src/storage/MMKVStorage';

describe('MMKVStorage', () => {
  let storage: MMKVStorage;

  beforeEach(() => {
    storage = new MMKVStorage();
  });

  test('returns null for missing key', () => {
    expect(storage.get('missing')).toBeNull();
  });

  test('stores and retrieves a value', () => {
    storage.set('cart_key', 'abc123');
    expect(storage.get('cart_key')).toBe('abc123');
  });

  test('deletes a value', () => {
    storage.set('cart_key', 'abc123');
    storage.delete('cart_key');
    expect(storage.get('cart_key')).toBeNull();
  });

  test('overwrites an existing value', () => {
    storage.set('key', 'first');
    storage.set('key', 'second');
    expect(storage.get('key')).toBe('second');
  });
});
