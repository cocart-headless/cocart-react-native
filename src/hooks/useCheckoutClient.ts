import type { CoCart, Response } from '@cocartheadless/sdk';
import type { CheckoutSDK, CheckoutState } from '@cocartheadless/checkout';
import { useCoCart } from './useCoCart';

/**
 * The checkout client from `@cocartheadless/checkout` (CoCart Plus 2.0), for the calls the hooks
 * don't cover: `getCheckoutConfig()`, `searchAddresses()`, `getAddressDetails()`.
 * Throws if `createCheckout()` isn't in `<CoCartProvider extensions>`.
 */
export function useCheckoutClient(): CheckoutSDK {
  return checkoutOf(useCoCart());
}

export function checkoutOf(client: CoCart): CheckoutSDK {
  if (!client.hasExtension('checkout')) {
    throw new Error(
      'The checkout hooks need the checkout extension: add extensions={[createCheckout()]} '
        + "to <CoCartProvider>, with createCheckout from '@cocartheadless/checkout'.",
    );
  }
  return client.extension('checkout');
}

// The checkout state a change returned, handed to every useCheckout() on the same client.
type Listener = (checkout: Response<CheckoutState>) => void;
const listeners = new WeakMap<CoCart, Set<Listener>>();

export function onCheckoutChange(client: CoCart, listener: Listener): () => void {
  const set = listeners.get(client) ?? new Set<Listener>();
  listeners.set(client, set);
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function checkoutChanged(client: CoCart, checkout: Response<CheckoutState>): void {
  listeners.get(client)?.forEach((listener) => listener(checkout));
}
