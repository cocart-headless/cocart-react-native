import React from 'react';

const mockAccountResource = {
  getProfile: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  updateProfile: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  changePassword: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getOrders: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getOrder: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getGuestOrder: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getOrderDownloads: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  getGuestOrderDownloads: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  getDownloads: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  getReviews: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  register: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  updateAddress: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  cancelOrder: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  verifyEmail: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  sendOrderEmailVerification: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  verifyOrderEmail: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getSubscriptions: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  suspendSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  reactivateSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  cancelSubscription: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  setSubscriptionAutoRenew: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  updateSubscriptionPaymentMethod: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  resubscribe: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  cancelResubscribe: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  requestOrderWithdrawal: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
};

const mockCartResource = {
  get: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  addItem: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  removeItem: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  updateItem: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  clear: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  getMini: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  removeAllItems: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  changePlan: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  applyCoupon: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  removeCoupon: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  removeCoupons: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
};

const mockProductsResource = {
  all: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  byCategory: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  byTag: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
};

type MockExtension = { name: string; install: (client: unknown) => unknown };

export class CoCart {
  private installed = new Map<string, unknown>();
  constructor(_siteURL?: string, options: { extensions?: MockExtension[] } = {}) {
    for (const extension of options.extensions ?? []) {
      this.installed.set(extension.name, extension.install(this));
    }
  }
  hasExtension(name: string) { return this.installed.has(name); }
  extension(name: string) { return this.installed.get(name); }
  restoreSession() { return Promise.resolve(); }
  cart() { return mockCartResource; }
  products() { return mockProductsResource; }
  account() { return mockAccountResource; }
}

export class CoCartError extends Error {
  constructor(message: string, public httpCode: number = 0, public errorCode: string | null = null) {
    super(message);
    this.name = 'CoCartError';
  }
}

export class AuthenticationError extends CoCartError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class TwoFactorAuthRequiredError extends AuthenticationError {
  availableProviders: string[] = [];
  defaultProvider: string | null = null;
  emailSent: boolean = false;
  constructor(message: string) {
    super(message);
    this.name = 'TwoFactorAuthRequiredError';
  }
}

export class ValidationError extends CoCartError {}
export class VersionError extends CoCartError {}
export class MemoryStorage {
  private store: Record<string, string> = {};
  get(key: string) { return this.store[key] ?? null; }
  set(key: string, value: string) { this.store[key] = value; }
  delete(key: string) { delete this.store[key]; }
}

export class Response {
  private data: unknown;
  constructor(data: unknown = {}) { this.data = data; }
  toObject() { return this.data; }
}

export class CheckoutResult {}
export function toPaymentDataPairs(data: unknown) { return data; }

export class CurrencyFormatter {}
export class JwtManager {}
export class SessionManager {}

export const mockCartResourceForTest = mockCartResource;
export const mockProductsResourceForTest = mockProductsResource;
export const mockAccountResourceForTest = mockAccountResource;
