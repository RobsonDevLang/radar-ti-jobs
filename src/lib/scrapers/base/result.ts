import type { RawContest } from "./scraper.interface";
import type { ScraperError, ScraperErrorKind } from "./errors";

export interface ScraperRunResult {
  source: string;
  displayName: string;
  ok: boolean;
  items: RawContest[];
  itemCount: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  error?: { kind: ScraperErrorKind; message: string; url?: string; status?: number };
}

export interface CollectionReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  scrapersRun: number;
  totalItems: number;
  succeeded: string[];
  failed: string[];
  results: ScraperRunResult[];
}

export function toResultError(error: ScraperError): ScraperRunResult["error"] {
  return {
    kind: error.kind,
    message: error.message,
    ...(error.url ? { url: error.url } : {}),
    ...(error.status ? { status: error.status } : {}),
  };
}

/** Agrega resultados individuais no relatório final da execução. */
export function buildReport(results: ScraperRunResult[], startedAt: string): CollectionReport {
  const finishedAt = new Date().toISOString();
  return {
    startedAt,
    finishedAt,
    durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
    scrapersRun: results.length,
    totalItems: results.reduce((sum, r) => sum + r.itemCount, 0),
    succeeded: results.filter((r) => r.ok).map((r) => r.source),
    failed: results.filter((r) => !r.ok).map((r) => r.source),
    results,
  };
}

/** Resumo pronto para gravação em execution_logs (Fase 4). */
export function summarizeReport(report: CollectionReport): string {
  return `${report.scrapersRun} coletor(es), ${report.totalItems} item(ns), ${report.failed.length} falha(s) em ${report.durationMs}ms`;
}
