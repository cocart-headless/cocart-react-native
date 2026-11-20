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
const mockRemoveAllItems = jest.fn().mockResolvedValue({});
const mockChangePlan = jest.fn().mockResolvedValue({});
const mockApplyCoupon = jest.fn().mockResolvedValue({});
const mockRemoveCoupon = jest.fn().mockResolvedValue({});
const mockRemoveCoupons = jest.fn().mockResolvedValue({});

beforeEach(() => {
  jest.clearAllMocks();
  const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
  MockCoCart.prototype.restoreSession = jest.fn().mockResolvedValue(undefined);
  MockCoCart.prototype.cart = jest.fn().mockReturnValue({
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    updateItem: mockUpdateItem,
    clear: mockClear,
    removeAllItems: mockRemoveAllItems,
    changePlan: mockChangePlan,
    applyCoupon: mockApplyCoupon,
    removeCoupon: mockRemoveCoupon,
    removeCoupons: mockRemoveCoupons,
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

  test('addItem passes plugin choices through', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.addItem('306', 1, { convert_to_sub: '1_month_0' }); });
    expect(mockAddItem).toHaveBeenCalledWith('306', 1, { convert_to_sub: '1_month_0' });
  });

  test('removeAllItems delegates to client.cart().removeAllItems', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.removeAllItems(); });
    expect(mockRemoveAllItems).toHaveBeenCalled();
  });

  test('changePlan delegates with the item key and plan value', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.changePlan('item-key-123', '0'); });
    expect(mockChangePlan).toHaveBeenCalledWith('item-key-123', '0');
  });

  test('applyCoupon delegates with the code and optional email', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.applyCoupon('SAVE10'); });
    expect(mockApplyCoupon).toHaveBeenCalledWith('SAVE10', undefined);
    await act(async () => { await result.current.applyCoupon('VIP20', 'jane@example.com'); });
    expect(mockApplyCoupon).toHaveBeenCalledWith('VIP20', 'jane@example.com');
  });

  test('removeCoupon and removeCoupons delegate', async () => {
    const { result } = renderHook(() => useCartMutations(), { wrapper });
    await act(async () => { await result.current.removeCoupon('SAVE10'); });
    await act(async () => { await result.current.removeCoupons(); });
    expect(mockRemoveCoupon).toHaveBeenCalledWith('SAVE10');
    expect(mockRemoveCoupons).toHaveBeenCalled();
  });

  test('a change waits for the stored cart key', async () => {
    let finishRestore: () => void = () => {};
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = jest.fn(
      () => new Promise<void>((resolve) => { finishRestore = resolve; }),
    );
    const { result } = renderHook(() => useCartMutations(), { wrapper });

    let added: Promise<unknown> = Promise.resolve();
    await act(async () => { added = result.current.addItem(1, 1); });
    expect(mockAddItem).not.toHaveBeenCalled();

    await act(async () => { finishRestore(); await added; });
    expect(mockAddItem).toHaveBeenCalledWith(1, 1, undefined);
  });
});
