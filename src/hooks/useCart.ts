import { useCallback, useEffect, useState } from 'react';
import type { Response } from '@cocartheadless/sdk';
import { useCoCartContext } from './useCoCart';

interface UseCartOptions {
  /** Fetch the lighter mini cart (`cart().getMini()`, CoCart Plus) instead of the full cart. */
  mini?: boolean;
}

interface UseCartResult {
  cart: Response | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCart(options: UseCartOptions = {}): UseCartResult {
  const { client, sessionRestored } = useCoCartContext();
  const [cart, setCart] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mini = options.mini === true;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Wait for the stored cart key, so a returning guest gets their cart, not a new one.
      await sessionRestored;
      const response = mini ? await client.cart().getMini() : await client.cart().get();
      setCart(response);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client, sessionRestored, mini]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cart, loading, error, refresh };
}
