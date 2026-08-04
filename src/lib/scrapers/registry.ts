import type { ContestScraper } from "./base/scraper.interface";

/**
 * Sistema de plugins: registrar um novo site = criar o scraper e chamar
 * registerScraper() no módulo do site. Nenhum scraper é registrado na Fase 3.
 */
const scrapers: ContestScraper[] = [];

export function registerScraper(scraper: ContestScraper): void {
  if (scrapers.some((s) => s.source === scraper.source)) {
    throw new Error(`Scraper já registrado: ${scraper.source}`);
  }
  scrapers.push(scraper);
}

export function unregisterScraper(source: string): void {
  const index = scrapers.findIndex((s) => s.source === source);
  if (index >= 0) scrapers.splice(index, 1);
}

/** Uso em testes: limpa todos os plugins registrados. */
export function clearScrapers(): void {
  scrapers.length = 0;
}

export function listScrapers(): readonly ContestScraper[] {
  return scrapers;
}

export function listEnabledScrapers(): readonly ContestScraper[] {
  return scrapers.filter((s) => s.enabled !== false);
}

export function getScraper(source: string): ContestScraper | undefined {
  return scrapers.find((s) => s.source === source);
}

/** Sites previstos (Fases 4 e 5), na ordem de implementação. */
export const PLANNED_SOURCES = [
  "PCI Concursos",
  "Ache Concursos",
  "JC Concursos",
  "Estratégia Concursos",
  "Gran Concursos",
  "Direção Concursos",
  "Concurso em Foco",
  "Folha Dirigida / QConcursos",
] as const;
