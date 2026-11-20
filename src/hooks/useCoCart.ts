import { useContext } from 'react';
import { CoCartContext } from '../provider/CoCartContext';

export function useCoCart() {
  return useCoCartContext().client;
}

/** The client and the promise that settles once the stored cart key has been read. */
export function useCoCartContext() {
  const ctx = useContext(CoCartContext);
  if (!ctx) throw new Error('useCoCart must be used within <CoCartProvider>');
  return ctx;
}
