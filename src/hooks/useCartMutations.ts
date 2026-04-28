import { useCallback } from 'react';
import { useCoCart } from './useCoCart';

export function useCartMutations() {
  const client = useCoCart();

  const addItem = useCallback(
    (productId: number, quantity: number, options?: Record<string, unknown>) =>
      client.cart().addItem(productId, quantity, options),
    [client],
  );

  const removeItem = useCallback(
    (itemKey: string) => client.cart().removeItem(itemKey),
    [client],
  );

  const updateItem = useCallback(
    (itemKey: string, quantity: number, options?: Record<string, unknown>) =>
      client.cart().updateItem(itemKey, quantity, options),
    [client],
  );

  const clear = useCallback(() => client.cart().clear(), [client]);

  return { addItem, removeItem, updateItem, clear };
}
