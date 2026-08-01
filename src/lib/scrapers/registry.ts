import type { ContestScraper } from "./types";

/**
 * Registry de scrapers. Adicionar um novo site = criar o arquivo do scraper e
 * incluí-lo nesta lista. Nenhum scraper é implementado na Fase 1.
 */
const scrapers: ContestScraper[] = [];

export function registerScraper(scraper: ContestScraper): void {
  if (scrapers.some((s) => s.source === scraper.source)) {
    throw new Error(`Scraper já registrado: ${scraper.source}`);
  }
  scrapers.push(scraper);
}

export function listScrapers(): readonly ContestScraper[] {
  return scrapers;
}

export function getScraper(source: string): ContestScraper | undefined {
  return scrapers.find((s) => s.source === source);
}

/** Sites previstos para a Fase 3. */
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
