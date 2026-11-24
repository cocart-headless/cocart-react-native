import { useCallback, useEffect, useState } from 'react';
import type { CheckoutPaymentMethodsResponse, SavedPaymentMethod } from '@cocartheadless/checkout';
import { useCoCartContext } from './useCoCart';
import { checkoutOf } from './useCheckoutClient';

interface UsePaymentMethodsOptions {
  /** Only this gateway's saved cards, e.g. `'stripe'`. */
  gateway?: string;
}

interface UsePaymentMethodsResult {
  /** The payment methods for this cart, as a list in the store's order. */
  methods: CheckoutPaymentMethodsResponse | null;
  /** A logged-in customer's saved payment methods, each with its `label` (empty for a guest). */
  savedCards: SavedPaymentMethod[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** The cart's payment methods and the customer's saved cards (CoCart Plus 2.0), in one request. */
export function usePaymentMethods(options: UsePaymentMethodsOptions = {}): UsePaymentMethodsResult {
  const { client, sessionRestored } = useCoCartContext();
  const checkoutClient = checkoutOf(client);
  const [methods, setMethods] = useState<CheckoutPaymentMethodsResponse | null>(null);
  const [savedCards, setSavedCards] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { gateway } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await sessionRestored;
      // Both read GET checkout/payment-methods: the client sends it once.
      const [response, cards] = await Promise.all([
        checkoutClient.getPaymentMethods(),
        checkoutClient.getSavedPaymentMethods(gateway),
      ]);
      setMethods(response.toObject());
      setSavedCards(cards);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [checkoutClient, sessionRestored, gateway]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { methods, savedCards, loading, error, refresh };
}
