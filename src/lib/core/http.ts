import { createLogger } from "./logger";

const log = createLogger("http");

export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

export function backoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  return Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Executa uma operação com retry exponencial em falhas temporárias. */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { attempts = 3, baseDelayMs = 500, maxDelayMs = 8000, sleep = defaultSleep } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delay = backoffDelay(attempt, baseDelayMs, maxDelayMs);
      log.warn("tentativa falhou, aguardando novo retry", { attempt, delay });
      await sleep(delay);
    }
  }
  throw lastError;
}

/** Limitador simples de requisições por intervalo, por host. */
export class RateLimiter {
  private lastCallAt = 0;

  constructor(
    private readonly minIntervalMs: number,
    private readonly now: () => number = () => Date.now(),
    private readonly sleep: (ms: number) => Promise<void> = defaultSleep,
  ) {}

  async acquire(): Promise<void> {
    const elapsed = this.now() - this.lastCallAt;
    const wait = this.minIntervalMs - elapsed;
    if (wait > 0) await this.sleep(wait);
    this.lastCallAt = this.now();
  }
}
