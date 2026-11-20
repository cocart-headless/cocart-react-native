import React, { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { CoCart } from '@cocartheadless/sdk';
import type { CoCartExtension, CoCartOptions } from '@cocartheadless/sdk';
import { CoCartContext } from './CoCartContext';

interface CoCartProviderProps {
  siteURL: string;
  options?: Partial<CoCartOptions>;
  /** Extensions to install on the client, e.g. `[createCheckout()]` for the checkout hooks. */
  extensions?: CoCartExtension[];
  autoRestoreSession?: boolean;
  children: React.ReactNode;
}

export function CoCartProvider({
  siteURL,
  options = {},
  extensions = [],
  autoRestoreSession = true,
  children,
}: CoCartProviderProps) {
  const client = useMemo(
    () => new CoCart(siteURL, { ...options, extensions: [...(options.extensions ?? []), ...extensions] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [siteURL],
  );

  // Started during render, not in an effect: children's effects run before the provider's,
  // so a hook's first request would otherwise go out before the cart key is read.
  // Sync storage (MMKVStorage) is already restored by the client; restoreSession() then
  // does nothing. It never rejects here: without the stored key, the client starts a new cart.
  const sessionRestored = useMemo(
    () => (autoRestoreSession ? client.restoreSession().catch(() => {}) : Promise.resolve()),
    [client, autoRestoreSession],
  );

  useEffect(() => {
    if (!autoRestoreSession) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.restoreSession().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [client, autoRestoreSession]);

  const value = useMemo(() => ({ client, sessionRestored }), [client, sessionRestored]);

  return (
    <CoCartContext.Provider value={value}>
      {children}
    </CoCartContext.Provider>
  );
}
