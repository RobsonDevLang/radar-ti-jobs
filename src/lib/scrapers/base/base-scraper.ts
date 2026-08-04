import { TtlCache } from "@/lib/core/cache";
import { RateLimiter, withRetry } from "@/lib/core/http";
import { createLogger, type Logger } from "@/lib/core/logger";

import { ScraperError, kindFromStatus, toScraperError } from "./errors";
import type { ContestScraper, RawContest, ScrapeParams } from "./scraper.interface";

export interface BaseScraperOptions {
  source: string;
  displayName: string;
  baseUrl: string;
  minIntervalMs?: number;
  timeoutMs?: number;
  cacheTtlMs?: number;
  retryAttempts?: number;
  userAgent?: string;
}

/**
 * Classe base: entrega HTTP com retry, rate limit por site, cache TTL e logs.
 * Cada scraper concreto implementa apenas o parsing em fetchList/parseDetail.
 */
export abstract class BaseScraper implements ContestScraper {
  readonly source: string;
  readonly displayName: string;
  readonly baseUrl: string;
  readonly minIntervalMs: number;
  readonly timeoutMs: number;
  enabled = true;

  protected readonly log: Logger;
  private readonly limiter: RateLimiter;
  private readonly cache: TtlCache<string>;
  private readonly retryAttempts: number;
  private readonly userAgent: string;

  constructor(options: BaseScraperOptions) {
    this.source = options.source;
    this.displayName = options.displayName;
    this.baseUrl = options.baseUrl;
    this.minIntervalMs = options.minIntervalMs ?? 1500;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.retryAttempts = options.retryAttempts ?? 3;
    this.userAgent = options.userAgent ?? "RadarConcursosTI/1.0 (+contato via app)";
    this.log = createLogger(`scraper:${this.source}`);
    this.limiter = new RateLimiter(this.minIntervalMs);
    this.cache = new TtlCache<string>(options.cacheTtlMs ?? 10 * 60 * 1000);
  }

  abstract fetchList(params: ScrapeParams): Promise<RawContest[]>;

  /** GET com rate limit, retry, timeout e cache — devolve o HTML/texto. */
  protected async fetchText(url: string, init: RequestInit = {}): Promise<string> {
    const cached = this.cache.get(url);
    if (cached !== undefined) {
      this.log.debug("cache hit", { url });
      return cached;
    }

    const body = await withRetry(
      async () => {
        await this.limiter.acquire();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
          const response = await fetch(url, {
            ...init,
            signal: controller.signal,
            headers: { "user-agent": this.userAgent, ...(init.headers ?? {}) },
          });
          if (!response.ok) {
            throw new ScraperError(
              kindFromStatus(response.status),
              this.source,
              `HTTP ${response.status} ao acessar ${url}`,
              { url, status: response.status },
            );
          }
          return await response.text();
        } catch (error) {
          throw toScraperError(this.source, error, url);
        } finally {
          clearTimeout(timer);
        }
      },
      { attempts: this.retryAttempts },
    );

    this.cache.set(url, body);
    return body;
  }

  /** Marca uma falha de parsing com o contexto correto. */
  protected parseError(message: string, url?: string): ScraperError {
    return new ScraperError("parse", this.source, message, { url });
  }

  clearCache(): void {
    this.cache.clear();
  }
}
