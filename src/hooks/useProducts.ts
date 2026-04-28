import { useCallback, useEffect, useState } from 'react';
import type { Response } from '@cocartheadless/sdk';
import { useCoCart } from './useCoCart';

interface UseProductsOptions {
  category?: string;
  tag?: string;
  filters?: Record<string, string>;
  autoFetch?: boolean;
}

interface UseProductsResult {
  products: Response | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const client = useCoCart();
  const [products, setProducts] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response: Response;
      if (options.category) {
        response = await client.products().byCategory(options.category);
      } else if (options.tag) {
        response = await client.products().byTag(options.tag);
      } else {
        response = await client.products().all(options.filters);
      }
      setProducts(response);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client, options.category, options.tag, options.filters]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      refresh();
    }
  }, [refresh, options.autoFetch]);

  return { products, loading, error, refresh };
}
