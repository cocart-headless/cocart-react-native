import React, { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { CoCart } from '@cocartheadless/sdk';
import type { CoCartOptions } from '@cocartheadless/sdk';
import { CoCartContext } from './CoCartContext';

interface CoCartProviderProps {
  siteURL: string;
  options?: Partial<CoCartOptions>;
  autoRestoreSession?: boolean;
  children: React.ReactNode;
}

export function CoCartProvider({
  siteURL,
  options = {},
  autoRestoreSession = true,
  children,
}: CoCartProviderProps) {
  const client = useMemo(
    () => new CoCart(siteURL, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [siteURL],
  );

  useEffect(() => {
    if (autoRestoreSession) {
      client.restoreSession();
    }
  }, [client, autoRestoreSession]);

  useEffect(() => {
    if (!autoRestoreSession) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.restoreSession();
      }
    });
    return () => sub.remove();
  }, [client, autoRestoreSession]);

  const value = useMemo(() => ({ client }), [client]);

  return (
    <CoCartContext.Provider value={value}>
      {children}
    </CoCartContext.Provider>
  );
}
