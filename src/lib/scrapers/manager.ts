import { createLogger } from "@/lib/core/logger";

import { ScraperError, toScraperError } from "./base/errors";
import type { ContestScraper, ScrapeParams } from "./base/scraper.interface";
import {
  buildReport,
  summarizeReport,
  toResultError,
  type CollectionReport,
  type ScraperRunResult,
} from "./base/result";
import { getScraper, listEnabledScrapers } from "./registry";

const log = createLogger("scraper-manager");

export interface RunOptions {
  /** Timeout por site (ms). Sobrepõe o timeout do próprio scraper. */
  timeoutMs?: number;
  /** Lista explícita de scrapers (usada em testes). */
  scrapers?: readonly ContestScraper[];
}

const DEFAULT_TIMEOUT_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number, source: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new ScraperError("timeout", source, `Tempo excedido (${ms}ms)`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Executa um scraper isoladamente: nunca lança, sempre devolve resultado. */
export async function runScraper(
  scraper: ContestScraper,
  params: ScrapeParams,
  options: RunOptions = {},
): Promise<ScraperRunResult> {
  const startedAt = new Date().toISOString();
  const start = Date.now();
  const timeoutMs = options.timeoutMs ?? scraper.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  log.info("iniciando coleta", { source: scraper.source, since: params.since });

  try {
    const items = await withTimeout(
      Promise.resolve().then(() => scraper.fetchList(params)),
      timeoutMs,
      scraper.source,
    );
    const durationMs = Date.now() - start;
    log.info("coleta concluída", {
      source: scraper.source,
      itemCount: items.length,
      durationMs,
    });
    return {
      source: scraper.source,
      displayName: scraper.displayName,
      ok: true,
      items,
      itemCount: items.length,
      durationMs,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } catch (error) {
    const scraperError = toScraperError(scraper.source, error);
    const durationMs = Date.now() - start;
    log.error("coleta falhou", { ...scraperError.toJSON(), durationMs });
    return {
      source: scraper.source,
      displayName: scraper.displayName,
      ok: false,
      items: [],
      itemCount: 0,
      durationMs,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: toResultError(scraperError),
    };
  }
}

/** Executa todos os scrapers habilitados em sequência; falhas ficam isoladas. */
export async function runAllScrapers(
  params: ScrapeParams,
  options: RunOptions = {},
): Promise<CollectionReport> {
  const startedAt = new Date().toISOString();
  const targets = options.scrapers ?? listEnabledScrapers();
  const results: ScraperRunResult[] = [];

  for (const scraper of targets) {
    results.push(await runScraper(scraper, params, options));
  }

  const report = buildReport(results, startedAt);
  log.info("execução finalizada", { resumo: summarizeReport(report) });
  return report;
}

/** Executa apenas um site pelo identificador registrado. */
export async function runSingleScraper(
  source: string,
  params: ScrapeParams,
  options: RunOptions = {},
): Promise<CollectionReport> {
  const startedAt = new Date().toISOString();
  const scraper = (options.scrapers ?? listEnabledScrapers()).find((s) => s.source === source) ??
    getScraper(source);
  if (!scraper) throw new Error(`Scraper não encontrado: ${source}`);
  return buildReport([await runScraper(scraper, params, options)], startedAt);
}

export { summarizeReport };
export type { CollectionReport, ScraperRunResult };
