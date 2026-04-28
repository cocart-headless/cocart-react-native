import { useCallback } from 'react';
import { useCoCart } from './useCoCart';
import type { AccountUpdateInput, AccountChangePasswordInput, AccountOrdersParams } from '@cocartheadless/sdk';

export function useAccount() {
  const client = useCoCart();

  const getProfile = useCallback(
    () => client.account().getProfile(),
    [client],
  );

  const updateProfile = useCallback(
    (data: AccountUpdateInput) => client.account().updateProfile(data),
    [client],
  );

  const changePassword = useCallback(
    (data: AccountChangePasswordInput) => client.account().changePassword(data),
    [client],
  );

  const getOrders = useCallback(
    (params?: AccountOrdersParams) => client.account().getOrders(params),
    [client],
  );

  const getOrder = useCallback(
    (id: number) => client.account().getOrder(id),
    [client],
  );

  const getGuestOrder = useCallback(
    (id: number, email: string) => client.account().getGuestOrder(id, email),
    [client],
  );

  const getOrderDownloads = useCallback(
    (id: number) => client.account().getOrderDownloads(id),
    [client],
  );

  const getGuestOrderDownloads = useCallback(
    (id: number, email: string) => client.account().getGuestOrderDownloads(id, email),
    [client],
  );

  const getDownloads = useCallback(
    () => client.account().getDownloads(),
    [client],
  );

  const getReviews = useCallback(
    () => client.account().getReviews(),
    [client],
  );

  return {
    getProfile,
    updateProfile,
    changePassword,
    getOrders,
    getOrder,
    getGuestOrder,
    getOrderDownloads,
    getGuestOrderDownloads,
    getDownloads,
    getReviews,
  };
}
