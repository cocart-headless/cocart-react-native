import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageInterface } from '@cocartheadless/sdk';

export class AsyncStorageAdapter implements StorageInterface {
  private prefix: string;

  constructor(prefix: string = 'cocart_') {
    this.prefix = prefix;
  }

  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(this.prefix + key);
  }

  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(this.prefix + key, value);
  }

  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(this.prefix + key);
  }
}
