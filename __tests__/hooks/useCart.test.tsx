import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useCart } from '../../src/hooks/useCart';
import { CoCart } from '@cocartheadless/sdk';

jest.mock('@cocartheadless/sdk');

function wrapper({ children }: { children: React.ReactNode }) {
  return <CoCartProvider siteURL="https://example.com">{children}</CoCartProvider>;
}

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('starts with loading true and cart null', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.cart).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test('fetches cart on mount', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cart).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('sets error when cart fetch fails', async () => {
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.cart = jest.fn().mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('Network error')),
    });

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.cart).toBeNull();
  });

  test('refresh re-fetches the cart', async () => {
    const mockGet = jest.fn().mockResolvedValue({ toObject: () => ({}) });
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.cart = jest.fn().mockReturnValue({ get: mockGet });

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.refresh(); });
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
