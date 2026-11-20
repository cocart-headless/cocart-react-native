import { createContext } from 'react';
import type { CoCart } from '@cocartheadless/sdk';

export interface CoCartContextValue {
  client: CoCart;
  /**
   * Settles once the stored cart key has been read (at once when `autoRestoreSession` is off).
   * The hooks wait for it before their cart requests; await it before calling the client
   * yourself on mount, or a guest's first request may start a new cart.
   */
  sessionRestored: Promise<void>;
}

export const CoCartContext = createContext<CoCartContextValue | null>(null);
