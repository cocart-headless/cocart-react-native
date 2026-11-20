import { useCallback } from 'react';
import { useCoCart } from './useCoCart';
import type {
  AccountUpdateInput, AccountChangePasswordInput, AccountOrdersParams, AccountSubscriptionsParams,
  AccountAddressUpdateInput, AccountSubscriptionPaymentMethodInput, DocumentParams,
  OrderWithdrawalInput, RegisterCustomerInput,
} from '@cocartheadless/sdk';

export function useAccount() {
  const client = useCoCart();

  /** Register a new customer (CoCart Plus). Doesn't need the customer logged in. */
  const register = useCallback(
    (data: RegisterCustomerInput) => client.account().register(data),
    [client],
  );

  const getProfile = useCallback(
    (params?: DocumentParams) => client.account().getProfile(params),
    [client],
  );

  const updateProfile = useCallback(
    (data: AccountUpdateInput) => client.account().updateProfile(data),
    [client],
  );

  /** Change the password. A wrong current password is a `ValidationError`. */
  const changePassword = useCallback(
    (data: AccountChangePasswordInput) => client.account().changePassword(data),
    [client],
  );

  const updateAddress = useCallback(
    (data: AccountAddressUpdateInput) => client.account().updateAddress(data),
    [client],
  );

  const getOrders = useCallback(
    (params?: AccountOrdersParams) => client.account().getOrders(params),
    [client],
  );

  const getOrder = useCallback(
    (id: number, params?: DocumentParams) => client.account().getOrder(id, params),
    [client],
  );

  const getGuestOrder = useCallback(
    (id: number, email: string, params?: DocumentParams) => client.account().getGuestOrder(id, email, params),
    [client],
  );

  const cancelOrder = useCallback(
    (id: number) => client.account().cancelOrder(id),
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
    (params?: Record<string, string>) => client.account().getReviews(params),
    [client],
  );

  const verifyEmail = useCallback(
    (key: string, userId: number) => client.account().verifyEmail(key, userId),
    [client],
  );

  const sendOrderEmailVerification = useCallback(
    () => client.account().sendOrderEmailVerification(),
    [client],
  );

  const verifyOrderEmail = useCallback(
    (key: string, userId: number) => client.account().verifyOrderEmail(key, userId),
    [client],
  );

  const getSubscriptions = useCallback(
    (params?: AccountSubscriptionsParams) => client.account().getSubscriptions(params),
    [client],
  );

  const getSubscription = useCallback(
    (id: number, email?: string, params?: DocumentParams) => client.account().getSubscription(id, email, params),
    [client],
  );

  const suspendSubscription = useCallback(
    (id: number) => client.account().suspendSubscription(id),
    [client],
  );

  const reactivateSubscription = useCallback(
    (id: number) => client.account().reactivateSubscription(id),
    [client],
  );

  const cancelSubscription = useCallback(
    (id: number) => client.account().cancelSubscription(id),
    [client],
  );

  const setSubscriptionAutoRenew = useCallback(
    (id: number, enabled: boolean) => client.account().setSubscriptionAutoRenew(id, enabled),
    [client],
  );

  const updateSubscriptionPaymentMethod = useCallback(
    (id: number, data: AccountSubscriptionPaymentMethodInput) =>
      client.account().updateSubscriptionPaymentMethod(id, data),
    [client],
  );

  const resubscribe = useCallback(
    (id: number) => client.account().resubscribe(id),
    [client],
  );

  const cancelResubscribe = useCallback(
    (id: number) => client.account().cancelResubscribe(id),
    [client],
  );

  /** Submit an order withdrawal request. Doesn't need the customer logged in. */
  const requestOrderWithdrawal = useCallback(
    (data: OrderWithdrawalInput) => client.account().requestOrderWithdrawal(data),
    [client],
  );

  return {
    register,
    getProfile,
    updateProfile,
    changePassword,
    updateAddress,
    getOrders,
    getOrder,
    getGuestOrder,
    cancelOrder,
    getOrderDownloads,
    getGuestOrderDownloads,
    getDownloads,
    getReviews,
    verifyEmail,
    sendOrderEmailVerification,
    verifyOrderEmail,
    getSubscriptions,
    getSubscription,
    suspendSubscription,
    reactivateSubscription,
    cancelSubscription,
    setSubscriptionAutoRenew,
    updateSubscriptionPaymentMethod,
    resubscribe,
    cancelResubscribe,
    requestOrderWithdrawal,
  };
}
