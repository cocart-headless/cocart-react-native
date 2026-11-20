import { useCallback, useEffect, useState } from 'react';
import type { Response } from '@cocartheadless/sdk';
import type { CheckoutState } from '@cocartheadless/checkout';
import { useCoCartContext } from './useCoCart';
import { checkoutOf, onCheckoutChange } from './useCheckoutClient';

interface UseCheckoutResult {
  checkout: Response<CheckoutState> | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * The checkout state for the current cart (CoCart Plus 2.0): items, `totals` and `total_lines`,
 * the addresses (`customer`), the shipping packages and their rates (`delivery.packages`) and
 * whether it needs paying (`payment.needs_payment`). Updates when `useCheckoutMutations().update()`
 * saves a change. Show it on the review screen: CoCart Plus records the total it showed.
 */
export function useCheckout(): UseCheckoutResult {
  const { client, sessionRestored } = useCoCartContext();
  const checkoutClient = checkoutOf(client);
  const [checkout, setCheckout] = useState<Response<CheckoutState> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Wait for the stored cart key, so a returning guest gets their cart, not a new one.
      await sessionRestored;
      setCheckout(await checkoutClient.getCheckout());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [checkoutClient, sessionRestored]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => onCheckoutChange(client, setCheckout), [client]);

  return { checkout, loading, error, refresh };
}
