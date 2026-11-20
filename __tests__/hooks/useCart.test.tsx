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

  test('waits for the stored cart key before fetching', async () => {
    // Children's effects run before the provider's: without waiting, a returning guest's
    // first request would go out without their cart key and start a new cart.
    let finishRestore: () => void = () => {};
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = jest.fn(
      () => new Promise<void>((resolve) => { finishRestore = resolve; }),
    );
    const mockGet = jest.fn().mockResolvedValue({ toObject: () => ({}) });
    MockCoCart.prototype.cart = jest.fn().mockReturnValue({ get: mockGet });

    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {});
    expect(mockGet).not.toHaveBeenCalled();

    await act(async () => { finishRestore(); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(MockCoCart.prototype.restoreSession).toHaveBeenCalledTimes(1);
  });

  test('still fetches when the stored cart key cannot be read', async () => {
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = jest.fn().mockRejectedValue(new Error('storage locked'));
    const mockGet = jest.fn().mockResolvedValue({ toObject: () => ({}) });
    MockCoCart.prototype.cart = jest.fn().mockReturnValue({ get: mockGet });

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  test('fetches the mini cart with mini: true', async () => {
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = jest.fn().mockResolvedValue(undefined);
    const mockGet = jest.fn().mockResolvedValue({ toObject: () => ({}) });
    const mockGetMini = jest.fn().mockResolvedValue({ toObject: () => ({}) });
    MockCoCart.prototype.cart = jest.fn().mockReturnValue({ get: mockGet, getMini: mockGetMini });

    const { result } = renderHook(() => useCart({ mini: true }), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetMini).toHaveBeenCalledTimes(1);
    expect(mockGet).not.toHaveBeenCalled();
  });

  test('does not wait for a restore when autoRestoreSession is false', async () => {
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = jest.fn(() => new Promise<void>(() => {}));
    const mockGet = jest.fn().mockResolvedValue({ toObject: () => ({}) });
    MockCoCart.prototype.cart = jest.fn().mockReturnValue({ get: mockGet });

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <CoCartProvider siteURL="https://example.com" autoRestoreSession={false}>{children}</CoCartProvider>
      ),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(MockCoCart.prototype.restoreSession).not.toHaveBeenCalled();
  });
});
