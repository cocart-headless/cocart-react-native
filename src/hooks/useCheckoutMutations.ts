import { useCallback } from 'react';
import type {
  CheckoutUpdateInput, ConfirmReturnOptions, PayForOrderInput, PlaceOrderInput,
} from '@cocartheadless/checkout';
import { useCoCartContext } from './useCoCart';
import { checkoutChanged, checkoutOf } from './useCheckoutClient';

/**
 * Checkout changes (CoCart Plus 2.0). `placeOrder()`, `payForOrder()` and `confirmReturn()` return
 * a `CheckoutResult`: a declined card is a failed result, not a thrown error.
 */
export function useCheckoutMutations() {
  const { client, sessionRestored } = useCoCartContext();
  const checkoutClient = checkoutOf(client);

  /** Save what the customer has entered so far, without placing the order. `useCheckout()` updates. */
  const update = useCallback(
    async (data: CheckoutUpdateInput) => {
      await sessionRestored;
      const checkout = await checkoutClient.updateCheckout(data);
      checkoutChanged(client, checkout);
      return checkout;
    },
    [client, checkoutClient, sessionRestored],
  );

  /**
   * Create the order and take payment. `payment_data` holds the keys the gateway reads, e.g.
   * `{ 'wc-stripe-payment-method': paymentMethod.id }`. After 3D Secure (`needsConfirmation`), call
   * it again with the same input: it completes the same order. Another request still taking payment
   * for the cart throws `CheckoutOutcomeUnknownError`, as a lost answer does.
   */
  const placeOrder = useCallback(
    async (input: PlaceOrderInput) => {
      await sessionRestored;
      return checkoutClient.placeOrder(input);
    },
    [checkoutClient, sessionRestored],
  );

  /**
   * How a checkout ended, when `placeOrder()` got no answer: it throws `CheckoutOutcomeUnknownError`
   * (from '@cocartheadless/checkout') with the `checkoutId` to ask about. `code` is `order_placed`,
   * `payment_required` (pay it with `payForOrder()`), `in_progress` (ask again shortly) or
   * `not_placed` (place the order again).
   */
  const getCheckoutStatus = useCallback(
    async (checkoutId: string) => {
      await sessionRestored;
      return checkoutClient.getCheckoutStatus(checkoutId);
    },
    [checkoutClient, sessionRestored],
  );

  /** Take payment for an unpaid (`pending` or `failed`) order, read as for `placeOrder()`. */
  const payForOrder = useCallback(
    (orderId: number, orderKey: string, input: PayForOrderInput) =>
      checkoutClient.payForOrder(orderId, orderKey, input),
    [checkoutClient],
  );

  /** Finish a payment from the URL the app was opened with after an off-site step. */
  const confirmReturn = useCallback(
    (url: string, options?: ConfirmReturnOptions) => checkoutClient.confirmReturn(url, options),
    [checkoutClient],
  );

  return { update, placeOrder, getCheckoutStatus, payForOrder, confirmReturn };
}
