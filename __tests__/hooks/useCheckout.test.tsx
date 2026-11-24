import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useCoCart } from '../../src/hooks/useCoCart';
import { useCheckout } from '../../src/hooks/useCheckout';
import { useCheckoutClient } from '../../src/hooks/useCheckoutClient';
import { useCheckoutMutations } from '../../src/hooks/useCheckoutMutations';
import { usePaymentMethods } from '../../src/hooks/usePaymentMethods';
import { useOrderReceived } from '../../src/hooks/useOrderReceived';

jest.mock('@cocartheadless/sdk');

function response(data: unknown) {
  return { toObject: () => data, get: (key: string) => (data as Record<string, unknown>)[key] };
}

const complete = { code: 'order_placed', isComplete: true, orderId: 217, orderKey: 'wc_order_abc' };

function makeCheckout() {
  return {
    getCheckout: jest.fn().mockResolvedValue(response({ needs_payment: true })),
    updateCheckout: jest.fn().mockResolvedValue(response({ needs_payment: false })),
    placeOrder: jest.fn().mockResolvedValue(complete),
    payForOrder: jest.fn().mockResolvedValue(complete),
    confirmReturn: jest.fn().mockResolvedValue(complete),
    getPaymentMethods: jest.fn().mockResolvedValue(response([{ id: 'stripe', title: 'Credit card' }])),
    getSavedPaymentMethods: jest.fn().mockResolvedValue([
      { id: 7, gatewayId: 'stripe', label: 'Visa ending in 4242', type: 'CC', expires: '12/2030', isDefault: true, supportsSubscriptions: true },
    ]),
    getOrderReceived: jest.fn().mockResolvedValue(response({ order_number: '217' })),
    getCheckoutStatus: jest.fn().mockResolvedValue({ checkoutId: 'chk_mine_00000000001', code: 'order_placed', message: 'Thank you. Your order has been received.', orderId: 217, orderKey: 'wc_order_abc', orderNumber: '217', orderStatus: 'processing' }),
  };
}

let checkout: ReturnType<typeof makeCheckout>;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CoCartProvider siteURL="https://example.com" extensions={[{ name: 'checkout', install: () => checkout }]}>
      {children}
    </CoCartProvider>
  );
}

describe('checkout hooks', () => {
  beforeEach(() => {
    checkout = makeCheckout();
  });

  test('without createCheckout() in extensions, the hooks say what to add', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const plain = ({ children }: { children: React.ReactNode }) => (
      <CoCartProvider siteURL="https://example.com">{children}</CoCartProvider>
    );
    expect(() => renderHook(() => useCheckout(), { wrapper: plain })).toThrow(/createCheckout\(\)/);
    consoleError.mockRestore();
  });

  test('the extensions prop installs alongside options.extensions', () => {
    const other = { name: 'other', install: () => ({}) };
    const both = ({ children }: { children: React.ReactNode }) => (
      <CoCartProvider
        siteURL="https://example.com"
        options={{ extensions: [other] }}
        extensions={[{ name: 'checkout', install: () => checkout }]}
      >
        {children}
      </CoCartProvider>
    );
    const { result } = renderHook(() => useCoCart(), { wrapper: both });
    expect(result.current.hasExtension('other')).toBe(true);
    expect(result.current.hasExtension('checkout')).toBe(true);
  });

  test('useCheckoutClient returns the checkout extension', () => {
    const { result } = renderHook(() => useCheckoutClient(), { wrapper });
    expect(result.current).toBe(checkout);
  });

  test('useCheckout loads the checkout state', async () => {
    const { result } = renderHook(() => useCheckout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(checkout.getCheckout).toHaveBeenCalledTimes(1);
    expect(result.current.checkout?.toObject()).toEqual({ needs_payment: true });
    expect(result.current.error).toBeNull();
  });

  test('useCheckout reports an error', async () => {
    checkout.getCheckout.mockRejectedValueOnce(new Error('Cart is empty'));
    const { result } = renderHook(() => useCheckout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('Cart is empty');
  });

  test('update() saves the change and useCheckout shows the state it returned', async () => {
    const { result } = renderHook(() => ({ state: useCheckout(), mutations: useCheckoutMutations() }), { wrapper });
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    const input = { billing_address: { country: 'FR', postcode: '75001' }, shipping_method: 'flat_rate:1' };
    await act(async () => { await result.current.mutations.update(input); });

    expect(checkout.updateCheckout).toHaveBeenCalledWith(input);
    expect(result.current.state.checkout?.toObject()).toEqual({ needs_payment: false });
    expect(checkout.getCheckout).toHaveBeenCalledTimes(1);
  });

  test('placeOrder, payForOrder and confirmReturn return the CheckoutResult', async () => {
    const { result } = renderHook(() => useCheckoutMutations(), { wrapper });
    const order = { payment_method: 'stripe', payment_data: { 'wc-stripe-payment-method': 'pm_123' } };

    let placed: unknown;
    let paid: unknown;
    let returned: unknown;
    await act(async () => {
      placed = await result.current.placeOrder(order);
      paid = await result.current.payForOrder(217, 'wc_order_abc', order);
      returned = await result.current.confirmReturn('myapp://order-received/217?key=wc_order_abc', { orderId: 217 });
    });

    expect(checkout.placeOrder).toHaveBeenCalledWith(order);
    expect(checkout.payForOrder).toHaveBeenCalledWith(217, 'wc_order_abc', order);
    expect(checkout.confirmReturn).toHaveBeenCalledWith('myapp://order-received/217?key=wc_order_abc', { orderId: 217 });
    expect(placed).toBe(complete);
    expect(paid).toBe(complete);
    expect(returned).toBe(complete);
  });

  test('getCheckoutStatus asks how a checkout ended', async () => {
    const { result } = renderHook(() => useCheckoutMutations(), { wrapper });

    let status: unknown;
    await act(async () => {
      status = await result.current.getCheckoutStatus('chk_mine_00000000001');
    });

    expect(checkout.getCheckoutStatus).toHaveBeenCalledWith('chk_mine_00000000001');
    expect(status).toEqual(expect.objectContaining({ code: 'order_placed', orderId: 217 }));
  });

  test('usePaymentMethods gives the methods and saved cards, for one gateway when asked', async () => {
    const { result } = renderHook(() => usePaymentMethods({ gateway: 'stripe' }), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(checkout.getSavedPaymentMethods).toHaveBeenCalledWith('stripe');
    expect(result.current.methods).toEqual([{ id: 'stripe', title: 'Credit card' }]);
    expect(result.current.savedCards).toHaveLength(1);
    expect(result.current.savedCards[0].id).toBe(7);
  });

  test('useOrderReceived loads the order', async () => {
    const { result } = renderHook(() => useOrderReceived(217, 'wc_order_abc'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(checkout.getOrderReceived).toHaveBeenCalledWith(217, 'wc_order_abc', { formatted: undefined, meta_keys: undefined });
    expect(result.current.order?.get('order_number')).toBe('217');
  });

  test('useOrderReceived passes formatted and meta_keys', async () => {
    const { result } = renderHook(
      () => useOrderReceived(217, 'wc_order_abc', { formatted: true, meta_keys: ['gift_message', '_note'] }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(checkout.getOrderReceived).toHaveBeenCalledWith(217, 'wc_order_abc', { formatted: true, meta_keys: ['gift_message', '_note'] });
  });
});
