import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { CoCartProvider } from '../../src/provider/CoCartProvider';
import { useCoCart } from '../../src/hooks/useCoCart';
import { CoCart } from '@cocartheadless/sdk';

jest.mock('@cocartheadless/sdk');

function TestConsumer() {
  const client = useCoCart();
  return <Text testID="ok">{client ? 'has-client' : 'no-client'}</Text>;
}

describe('CoCartProvider', () => {
  test('provides client to consumers', async () => {
    const { getByTestId } = render(
      <CoCartProvider siteURL="https://example.com">
        <TestConsumer />
      </CoCartProvider>,
    );
    expect(getByTestId('ok').props.children).toBe('has-client');
  });

  test('calls restoreSession on mount when autoRestoreSession is true', async () => {
    const mockRestore = jest.fn().mockResolvedValue(undefined);
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = mockRestore;

    render(
      <CoCartProvider siteURL="https://example.com">
        <TestConsumer />
      </CoCartProvider>,
    );

    await act(async () => {});
    expect(mockRestore).toHaveBeenCalled();
  });

  test('does not call restoreSession when autoRestoreSession is false', async () => {
    const mockRestore = jest.fn().mockResolvedValue(undefined);
    const MockCoCart = CoCart as jest.MockedClass<typeof CoCart>;
    MockCoCart.prototype.restoreSession = mockRestore;

    render(
      <CoCartProvider siteURL="https://example.com" autoRestoreSession={false}>
        <TestConsumer />
      </CoCartProvider>,
    );

    await act(async () => {});
    expect(mockRestore).not.toHaveBeenCalled();
  });
});

describe('useCoCart', () => {
  test('throws when used outside CoCartProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useCoCart must be used within <CoCartProvider>');
    spy.mockRestore();
  });
});
