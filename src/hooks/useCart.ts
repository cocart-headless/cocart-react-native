import { useCallback, useEffect, useState } from 'react';
import type { Response } from '@cocartheadless/sdk';
import { useCoCart } from './useCoCart';

interface UseCartResult {
  cart: Response | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCart(): UseCartResult {
  const client = useCoCart();
  const [cart, setCart] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.cart().get();
      setCart(response);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cart, loading, error, refresh };
}
