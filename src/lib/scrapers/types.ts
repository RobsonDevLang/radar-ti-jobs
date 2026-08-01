/** Contrato único que todo site de concursos deve implementar (Fase 3). */
export interface RawContest {
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
}

export interface ContestScraper {
  /** Identificador estável usado no banco (ex.: "pci-concursos"). */
  source: string;
  displayName: string;
  baseUrl: string;
  /** Intervalo mínimo entre requisições, em ms (rate limiting). */
  minIntervalMs: number;
  fetchList(params: ScrapeParams): Promise<RawContest[]>;
  parseDetail?(url: string): Promise<Partial<RawContest>>;
}
