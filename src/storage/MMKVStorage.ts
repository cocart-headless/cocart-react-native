import { MMKV } from 'react-native-mmkv';
import type { StorageInterface } from '@cocartheadless/sdk';

export class MMKVStorage implements StorageInterface {
  private mmkv: MMKV;

  constructor(id: string = 'cocart') {
    this.mmkv = new MMKV({ id });
  }

  get(key: string): string | null {
    return this.mmkv.getString(key) ?? null;
  }

  set(key: string, value: string): void {
    this.mmkv.set(key, value);
  }

  delete(key: string): void {
    this.mmkv.delete(key);
  }
}
