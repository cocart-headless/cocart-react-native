export class MMKV {
  private store: Record<string, string> = {};

  getString(key: string): string | undefined {
    return this.store[key];
  }

  set(key: string, value: string): void {
    this.store[key] = value;
  }

  delete(key: string): void {
    delete this.store[key];
  }
}
