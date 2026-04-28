import { useContext } from 'react';
import { CoCartContext } from '../provider/CoCartContext';

export function useCoCart() {
  const ctx = useContext(CoCartContext);
  if (!ctx) throw new Error('useCoCart must be used within <CoCartProvider>');
  return ctx.client;
}
