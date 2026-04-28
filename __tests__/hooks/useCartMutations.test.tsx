import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useCartMutations } from '../../src/hooks/useCartMutations';
import { CoCart } from '@cocartheadless/sdk';

jest.mock('@cocartheadless/sdk');

const mockAddItem = jest.fn().mockResolvedValue({});
const mockRemoveItem = jest.fn().mockResolvedValue({});
const mockUpdateItem = jest.fn().mockResolvedValue({});
const mockClear = jest.fn().mockResolvedValue({});

beforeEach(() => {
  jest.clearAllMocks();
  const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
  MockCoCart.prototype.cart = jest.fn().mockReturnValue({
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    updateItem: mockUpdateItem,
    clear: mockClear,
  });
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <CoCartProvider siteURL="https://example.com">{children}</CoCartProvider>;
}

describe('useCartMutations', () => {
  test('addItem delegates to client.cart().addItem', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.addItem(1, 2); });
    expect(mockAddItem).toHaveBeenCalledWith(1, 2, undefined);
  });

  test('removeItem delegates to client.cart().removeItem', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.removeItem('item-key-123'); });
    expect(mockRemoveItem).toHaveBeenCalledWith('item-key-123');
  });

  test('updateItem delegates to client.cart().updateItem', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.updateItem('item-key-123', 3); });
    expect(mockUpdateItem).toHaveBeenCalledWith('item-key-123', 3, undefined);
  });

  test('clear delegates to client.cart().clear', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.clear(); });
    expect(mockClear).toHaveBeenCalled();
  });
});
