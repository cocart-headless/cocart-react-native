import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useProducts } from '../../src/hooks/useProducts';
import { CoCart } from '@cocartheadless/sdk';

jest.mock('@cocartheadless/sdk');

const mockAll = jest.fn().mockResolvedValue({ toObject: () => [] });
const mockCategory = jest.fn().mockResolvedValue({ toObject: () => [] });
const mockTag = jest.fn().mockResolvedValue({ toObject: () => [] });

beforeEach(() => {
  jest.clearAllMocks();
  const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
  MockCoCart.prototype.products = jest.fn().mockReturnValue({
    all: mockAll,
    category: mockCategory,
    tag: mockTag,
  });
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <CoCartProvider siteURL="https://example.com">{children}</CoCartProvider>;
}

describe('useProducts', () => {
  test('calls products().all() by default', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockAll).toHaveBeenCalled();
  });

  test('calls products().category() when category is provided', async () => {
    const { result } = renderHook(() => useProducts({ category: 'shirts' }), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockCategory).toHaveBeenCalledWith('shirts');
  });

  test('calls products().tag() when tag is provided', async () => {
    const { result } = renderHook(() => useProducts({ tag: 'sale' }), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockTag).toHaveBeenCalledWith('sale');
  });

  test('does not auto-fetch when autoFetch is false', async () => {
    renderHook(() => useProducts({ autoFetch: false }), { wrapper });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockAll).not.toHaveBeenCalled();
  });

  test('sets error when fetch fails', async () => {
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.products = jest.fn().mockReturnValue({
      all: jest.fn().mockRejectedValue(new Error('fetch failed')),
      category: jest.fn(),
      tag: jest.fn(),
    });

    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('fetch failed');
  });
});
