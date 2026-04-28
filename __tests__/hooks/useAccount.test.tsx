import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useAccount } from '../../src/hooks/useAccount';
import { CoCart } from '@cocartheadless/sdk';

jest.mock('@cocartheadless/sdk');

const mockGetProfile = jest.fn().mockResolvedValue({ toObject: () => ({}) });
const mockUpdateProfile = jest.fn().mockResolvedValue({ toObject: () => ({}) });
const mockChangePassword = jest.fn().mockResolvedValue({ toObject: () => ({}) });
const mockGetOrders = jest.fn().mockResolvedValue({ toObject: () => ({}) });
const mockGetOrder = jest.fn().mockResolvedValue({ toObject: () => ({}) });
const mockGetGuestOrder = jest.fn().mockResolvedValue({ toObject: () => ({}) });
const mockGetOrderDownloads = jest.fn().mockResolvedValue({ toObject: () => ([]) });
const mockGetGuestOrderDownloads = jest.fn().mockResolvedValue({ toObject: () => ([]) });
const mockGetDownloads = jest.fn().mockResolvedValue({ toObject: () => ([]) });
const mockGetReviews = jest.fn().mockResolvedValue({ toObject: () => ([]) });

beforeEach(() => {
  jest.clearAllMocks();
  const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
  MockCoCart.prototype.account = jest.fn().mockReturnValue({
    getProfile: mockGetProfile,
    updateProfile: mockUpdateProfile,
    changePassword: mockChangePassword,
    getOrders: mockGetOrders,
    getOrder: mockGetOrder,
    getGuestOrder: mockGetGuestOrder,
    getOrderDownloads: mockGetOrderDownloads,
    getGuestOrderDownloads: mockGetGuestOrderDownloads,
    getDownloads: mockGetDownloads,
    getReviews: mockGetReviews,
  });
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <CoCartProvider siteURL="https://example.com">{children}</CoCartProvider>;
}

describe('useAccount', () => {
  test('getProfile delegates to client.account().getProfile()', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getProfile(); });
    expect(mockGetProfile).toHaveBeenCalled();
  });

  test('updateProfile delegates with data', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    const data = { first_name: 'Jane' };
    await act(async () => { await result.current.updateProfile(data as any); });
    expect(mockUpdateProfile).toHaveBeenCalledWith(data);
  });

  test('changePassword delegates with remapped fields', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    const data = { current: 'old', password: 'new', confirm: 'new' };
    await act(async () => { await result.current.changePassword(data as any); });
    expect(mockChangePassword).toHaveBeenCalledWith(data);
  });

  test('getOrders delegates with params', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrders({ per_page: 5 }); });
    expect(mockGetOrders).toHaveBeenCalledWith({ per_page: 5 });
  });

  test('getOrders delegates with no params', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrders(); });
    expect(mockGetOrders).toHaveBeenCalledWith(undefined);
  });

  test('getOrder delegates with id', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrder(42); });
    expect(mockGetOrder).toHaveBeenCalledWith(42);
  });

  test('getGuestOrder delegates with id and email', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getGuestOrder(7, 'guest@example.com'); });
    expect(mockGetGuestOrder).toHaveBeenCalledWith(7, 'guest@example.com');
  });

  test('getOrderDownloads delegates with id', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getOrderDownloads(3); });
    expect(mockGetOrderDownloads).toHaveBeenCalledWith(3);
  });

  test('getGuestOrderDownloads delegates with id and email', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getGuestOrderDownloads(3, 'g@x.com'); });
    expect(mockGetGuestOrderDownloads).toHaveBeenCalledWith(3, 'g@x.com');
  });

  test('getDownloads delegates to client.account().getDownloads()', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getDownloads(); });
    expect(mockGetDownloads).toHaveBeenCalled();
  });

  test('getReviews delegates to client.account().getReviews()', async () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    await act(async () => { await result.current.getReviews(); });
    expect(mockGetReviews).toHaveBeenCalled();
  });
});
