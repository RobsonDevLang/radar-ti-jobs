/** Contrato único que todo site de concursos deve implementar. */
export interface RawContest {
  /** Identificador do item no site de origem. */
  sourceId: string;
  title: string;
  organization?: string;
  role?: string;
  salary?: string;
  vacancies?: number;
  talentPool?: boolean;
  education?: string;
  requirements?: string;
  city?: string;
  state?: string;
  examBoard?: string;
  publishedAt?: string;
  registrationEndsAt?: string;
  status?: string;
  officialUrl?: string;
  newsUrl?: string;
}

export interface ScrapeParams {
  /** Buscar itens publicados a partir desta data (ISO). */
  since: string;
  /** Limite opcional de itens por execução. */
  limit?: number;
}

export interface ContestScraper {
  /** Identificador estável usado no banco (ex.: "pci-concursos"). */
  source: string;
  displayName: string;
  baseUrl: string;
  /** Intervalo mínimo entre requisições, em ms (rate limiting). */
  minIntervalMs: number;
  /** Tempo máximo de execução do scraper, em ms. */
  timeoutMs?: number;
  /** Desliga o scraper sem removê-lo do registry. */
  enabled?: boolean;
  fetchList(params: ScrapeParams): Promise<RawContest[]>;
  parseDetail?(url: string): Promise<Partial<RawContest>>;
}
