import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useAccount } from '../../src/hooks/useAccount';
import { CoCart } from '@cocartheadless/sdk';

jest.mock('@cocartheadless/sdk');

function wrapper({ children }: { children: React.ReactNode }) {
  return <CoCartProvider siteURL="https://example.com">{children}</CoCartProvider>;
}

describe('useAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeAccountResource(overrides: Record<string, jest.Mock> = {}) {
    const resource = {
      getProfile: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      updateProfile: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      changePassword: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      getOrders: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      getOrder: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      getGuestOrder: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      getOrderDownloads: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
      getGuestOrderDownloads: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
      getDownloads: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
      getReviews: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
      register: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      updateAddress: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      cancelOrder: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      verifyEmail: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      sendOrderEmailVerification: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      verifyOrderEmail: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      getSubscriptions: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      getSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      suspendSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      reactivateSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      cancelSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      setSubscriptionAutoRenew: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      updateSubscriptionPaymentMethod: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      resubscribe: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      cancelResubscribe: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      requestOrderWithdrawal: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
      ...overrides,
    };
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.account = jest.fn().mockReturnValue(resource);
    return resource;
  }

  test('getProfile delegates to client.account().getProfile()', async () => {
    const { getProfile } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getProfile(); });
    expect(getProfile).toHaveBeenCalled();
  });

  test('updateProfile delegates with data', async () => {
    const { updateProfile } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    const data = { first_name: 'Jane' };
    await act(async () => { await result.current.updateProfile(data as any); });
    expect(updateProfile).toHaveBeenCalledWith(data);
  });

  test('changePassword delegates with the passwords only', async () => {
    const { changePassword } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    const data = { current: 'old', password: 'new', confirm: 'new' };
    await act(async () => { await result.current.changePassword(data); });
    expect(changePassword).toHaveBeenCalledWith(data);
  });

  test('getOrders delegates with params', async () => {
    const { getOrders } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrders({ per_page: 5 }); });
    expect(getOrders).toHaveBeenCalledWith({ per_page: 5 });
  });

  test('getOrders delegates with no params', async () => {
    const { getOrders } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrders(); });
    expect(getOrders).toHaveBeenCalledWith(undefined);
  });

  test('getOrder delegates with id', async () => {
    const { getOrder } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrder(42); });
    expect(getOrder).toHaveBeenCalledWith(42, undefined);
  });

  test('getGuestOrder delegates with id and email', async () => {
    const { getGuestOrder } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getGuestOrder(7, 'guest@example.com'); });
    expect(getGuestOrder).toHaveBeenCalledWith(7, 'guest@example.com', undefined);
  });

  test('getOrderDownloads delegates with id', async () => {
    const { getOrderDownloads } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrderDownloads(3); });
    expect(getOrderDownloads).toHaveBeenCalledWith(3);
  });

  test('getGuestOrderDownloads delegates with id and email', async () => {
    const { getGuestOrderDownloads } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getGuestOrderDownloads(3, 'g@x.com'); });
    expect(getGuestOrderDownloads).toHaveBeenCalledWith(3, 'g@x.com');
  });

  test('getDownloads delegates to client.account().getDownloads()', async () => {
    const { getDownloads } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getDownloads(); });
    expect(getDownloads).toHaveBeenCalled();
  });

  test('getReviews delegates to client.account().getReviews()', async () => {
    const { getReviews } = makeAccountResource();
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getReviews(); });
    expect(getReviews).toHaveBeenCalled();
  });

  // The CoCart Plus 2.0 account routes: each hook method passes its arguments through.
  test.each([
    ['register', [{ email: 'jane@example.com', username: 'jane' }]],
    ['updateAddress', [{ billing_address: { first_name: 'Jane' } }]],
    ['cancelOrder', [123]],
    ['verifyEmail', ['key-abc', 42]],
    ['sendOrderEmailVerification', []],
    ['verifyOrderEmail', ['key-abc', 42]],
    ['getSubscriptions', [{ page: 1, per_page: 10 }]],
    ['getSubscription', [512, 'guest@example.com', { formatted: true }]],
    ['suspendSubscription', [512]],
    ['reactivateSubscription', [512]],
    ['cancelSubscription', [512]],
    ['setSubscriptionAutoRenew', [512, false]],
    ['updateSubscriptionPaymentMethod', [512, { payment_method: 'stripe', token_id: 7 }]],
    ['resubscribe', [512]],
    ['cancelResubscribe', [512]],
    ['requestOrderWithdrawal', [{ first_name: 'Jane', order_number: '1042' }]],
  ] as [string, unknown[]][])('%s delegates to client.account()', async (name, args) => {
    const resource = makeAccountResource() as Record<string, jest.Mock>;
    const { result } = renderHook(() => useAccount(), { wrapper });
    const method = (result.current as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[name];
    await act(async () => { await method(...args); });
    expect(resource[name]).toHaveBeenCalledWith(...args);
  });
});
