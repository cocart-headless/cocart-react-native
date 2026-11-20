import { useCallback } from 'react';
import type { AddItemOptions, Response } from '@cocartheadless/sdk';
import { useCoCartContext } from './useCoCart';

export function useCartMutations() {
  const { client, sessionRestored } = useCoCartContext();

  // Each change waits for the stored cart key, so it lands in the guest's existing cart.
  const run = useCallback(
    async (send: () => Promise<Response>) => {
      await sessionRestored;
      return send();
    },
    [sessionRestored],
  );

  const addItem = useCallback(
    (productId: string | number, quantity: number, options?: AddItemOptions) =>
      run(() => client.cart().addItem(productId, quantity, options)),
    [client, run],
  );

  const removeItem = useCallback(
    (itemKey: string) => run(() => client.cart().removeItem(itemKey)),
    [client, run],
  );

  const updateItem = useCallback(
    (itemKey: string, quantity: number, options?: Record<string, unknown>) =>
      run(() => client.cart().updateItem(itemKey, quantity, options)),
    [client, run],
  );

  const clear = useCallback(() => run(() => client.cart().clear()), [client, run]);

  /** Remove every item but keep the cart's coupons, fees and customer details (CoCart Plus). */
  const removeAllItems = useCallback(
    () => run(() => client.cart().removeAllItems()),
    [client, run],
  );

  /** Switch a cart item to another subscription plan, or to one-time with `'0'` (CoCart Plus). */
  const changePlan = useCallback(
    (itemKey: string, value: string) => run(() => client.cart().changePlan(itemKey, value)),
    [client, run],
  );

  /** Apply a coupon (CoCart Plus). Pass the customer's email for coupons restricted to certain emails. */
  const applyCoupon = useCallback(
    (code: string, email?: string) => run(() => client.cart().applyCoupon(code, email)),
    [client, run],
  );

  const removeCoupon = useCallback(
    (code: string) => run(() => client.cart().removeCoupon(code)),
    [client, run],
  );

  const removeCoupons = useCallback(
    () => run(() => client.cart().removeCoupons()),
    [client, run],
  );

  return {
    addItem,
    removeItem,
    updateItem,
    clear,
    removeAllItems,
    changePlan,
    applyCoupon,
    removeCoupon,
    removeCoupons,
  };
}
