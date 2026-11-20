import { useCallback, useEffect, useState } from 'react';
import type { Response } from '@cocartheadless/sdk';
import type { CheckoutParams, OrderReceived } from '@cocartheadless/checkout';
import { useCoCart } from './useCoCart';
import { checkoutOf } from './useCheckoutClient';

interface UseOrderReceivedResult {
  order: Response<OrderReceived> | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * The order for the thank-you screen (CoCart Plus 2.0). No cart needed. Pass `formatted: true` for
 * amounts ready to display, and `meta_keys` to narrow the order's `meta`.
 */
export function useOrderReceived(
  orderId: number,
  orderKey: string,
  options: Pick<CheckoutParams, 'formatted' | 'meta_keys'> = {},
): UseOrderReceivedResult {
  const checkoutClient = checkoutOf(useCoCart());
  const formatted = options.formatted;
  const metaKeys = options.meta_keys?.join(',');
  const [order, setOrder] = useState<Response<OrderReceived> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOrder(await checkoutClient.getOrderReceived(orderId, orderKey, {
        formatted,
        meta_keys: metaKeys ? metaKeys.split(',') : undefined,
      }));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [checkoutClient, orderId, orderKey, formatted, metaKeys]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { order, loading, error, refresh };
}
