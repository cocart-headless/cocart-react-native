import { createContext } from 'react';
import type { CoCart } from '@cocartheadless/sdk';

export interface CoCartContextValue {
  client: CoCart;
}

export const CoCartContext = createContext<CoCartContextValue | null>(null);
