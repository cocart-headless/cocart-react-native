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
};

const mockCartResource = {
  get: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  addItem: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  removeItem: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  updateItem: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
  clear: jest.fn().mockResolvedValue({ toObject: () => ({}) }),
};

const mockProductsResource = {
  all: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  category: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
  tag: jest.fn().mockResolvedValue({ toObject: () => ([]) }),
};

export class CoCart {
  restoreSession = jest.fn().mockResolvedValue(undefined);
  cart = jest.fn().mockReturnValue(mockCartResource);
  products = jest.fn().mockReturnValue(mockProductsResource);
  account = jest.fn().mockReturnValue(mockAccountResource);
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

export class CurrencyFormatter {}
export class JwtManager {}
export class SessionManager {}

export const mockCartResourceForTest = mockCartResource;
export const mockProductsResourceForTest = mockProductsResource;
export const mockAccountResourceForTest = mockAccountResource;
