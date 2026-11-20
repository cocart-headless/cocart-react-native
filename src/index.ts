// Re-export core SDK
export { CoCart, Response, CurrencyFormatter, JwtManager, SessionManager } from '@cocartheadless/sdk';
export { CoCartError, AuthenticationError, TwoFactorAuthRequiredError, ValidationError, VersionError } from '@cocartheadless/sdk';
export { MemoryStorage } from '@cocartheadless/sdk';
// The result of a call that can take payment (checkout, subscription payment method changes).
export { CheckoutResult, toPaymentDataPairs } from '@cocartheadless/sdk';
export type { PaymentResultCode, PaymentDataInput, PaymentDataPair, CoCartExtension } from '@cocartheadless/sdk';
export type { CoCartOptions, StorageInterface, JwtOptions, TwoFactorAuthChallenge } from '@cocartheadless/sdk';
export type {
  CartItemData, CartResponse, CartItem, CartTotals, CartTotalsBreakdown, CartCustomer,
  CartBillingAddress, CartShippingAddress, CartShipping, CartCoupon, CartFee, CartTax,
  ShippingPackage, ShippingRate, CurrencyInfo, AddItemOptions, CartGetParams, RateLimitInfo,
} from '@cocartheadless/sdk';
export type {
  Product, ProductVariation, ProductImage, ProductPrices, ProductCategory, ProductCategoryDetail,
  ProductTag, ProductAttribute, ProductAttributeDetail, ProductVariationSummary, ProductReview,
  ProductListParams, ProductOrderBy, SortOrder, StockStatus, ProductShippingRatesParams,
  ProductReviewInput, StoreInfo, SessionItem,
} from '@cocartheadless/sdk';
export type {
  AccountProfile, AccountUpdateInput, AccountChangePasswordInput,
  AccountOrdersParams, AccountOrdersResponse, AccountOrderDetail,
  AccountDownload, AccountAddress, AccountUser, AccountOrderSummary,
  AccountAddressUpdateInput, AccountCancelOrderResult, AccountSubscriptionPaymentMethodInput,
  AccountSubscriptionPaymentMethodResult, OrderWithdrawalInput, RegisterCustomerInput, RegisteredCustomer,
} from '@cocartheadless/sdk';
// Extension data (CoCart Plus integrations). Augment CartExtensions, CartItemExtensions and
// ProductExtensions in the '@cocartheadless/sdk' module for other plugins' data.
export type {
  CartExtensions, CartItemExtensions, ProductExtensions, MinorUnitAmount,
  SubscriptionData, SubscriptionSchemeOption, CartItemSubscriptionSchemeOption, RecurringTotal,
  BookingCartItemData, BookingProductData, AccommodationBookingCartItemData, AccommodationBookingProductData,
  ChildItemQuantity, CompositeCartItemComponent, CompositeCartItemData, CompositeProductData,
  BundleCartItemData, BundleProductData, AddonCartItemField, AddonProductField,
  DiscountData, DynamicPricingCartItemData, MsrpData, PointsProductData, PointsCartData,
  QuantityRulesData, VendorData, ProductConditionData, WarrantyCartItemData, WarrantyProductData,
} from '@cocartheadless/sdk';

// Storage adapters
export { MMKVStorage } from './storage/MMKVStorage';
export { AsyncStorageAdapter } from './storage/AsyncStorageAdapter';

// React Context + Provider
export { CoCartContext } from './provider/CoCartContext';
export type { CoCartContextValue } from './provider/CoCartContext';
export { CoCartProvider } from './provider/CoCartProvider';

// Hooks
export { useCoCart, useCoCartContext } from './hooks/useCoCart';
export { useCart } from './hooks/useCart';
export { useCartMutations } from './hooks/useCartMutations';
export { useProducts } from './hooks/useProducts';
export { useAccount } from './hooks/useAccount';

// Checkout hooks (CoCart Plus 2.0): need createCheckout() from '@cocartheadless/checkout'
// in <CoCartProvider extensions>.
export { useCheckoutClient } from './hooks/useCheckoutClient';
export { useCheckout } from './hooks/useCheckout';
export { usePaymentMethods } from './hooks/usePaymentMethods';
export { useCheckoutMutations } from './hooks/useCheckoutMutations';
export { useOrderReceived } from './hooks/useOrderReceived';
export type {
  CheckoutSDK, CheckoutState, CheckoutUpdateInput, CheckoutPaymentMethodsResponse, PlaceOrderInput,
  PayForOrderInput, ConfirmReturnOptions, SavedPaymentMethod, OrderReceived, CheckoutConfig, CheckoutStatus,
} from '@cocartheadless/checkout';
