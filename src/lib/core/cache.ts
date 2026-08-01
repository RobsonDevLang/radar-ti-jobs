interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}

/** Cache em memória com TTL, usado para evitar consultas repetidas aos sites. */
export class TtlCache<T> {
  private store = new Map<string, CacheRecord<T>>();

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  get(key: string): T | undefined {
    const record = this.store.get(key);
    if (!record) return undefined;
    if (record.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return record.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
