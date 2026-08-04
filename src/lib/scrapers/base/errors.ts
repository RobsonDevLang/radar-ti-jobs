export type ScraperErrorKind = "network" | "parse" | "blocked" | "timeout" | "unknown";

/** Erro classificado, sempre com o site de origem no contexto. */
export class ScraperError extends Error {
  readonly kind: ScraperErrorKind;
  readonly source: string;
  readonly url?: string;
  readonly status?: number;
  override readonly cause?: unknown;

  constructor(
    kind: ScraperErrorKind,
    source: string,
    message: string,
    options: { url?: string; status?: number; cause?: unknown } = {},
  ) {
    super(message);
    this.name = "ScraperError";
    this.kind = kind;
    this.source = source;
    this.url = options.url;
    this.status = options.status;
    this.cause = options.cause;
  }

  toJSON() {
    return {
      kind: this.kind,
      source: this.source,
      message: this.message,
      ...(this.url ? { url: this.url } : {}),
      ...(this.status ? { status: this.status } : {}),
    };
  }
}

/** Deriva o tipo de falha a partir de um status HTTP. */
export function kindFromStatus(status: number): ScraperErrorKind {
  if (status === 403 || status === 429) return "blocked";
  if (status === 408 || status === 504) return "timeout";
  return "network";
}

/** Converte qualquer erro em ScraperError, preservando a classificação. */
export function toScraperError(source: string, error: unknown, url?: string): ScraperError {
  if (error instanceof ScraperError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const kind: ScraperErrorKind = /timeout|abort/i.test(message) ? "timeout" : "unknown";
  return new ScraperError(kind, source, message, { url, cause: error });
}
