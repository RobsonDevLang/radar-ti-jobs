import type { RawContest } from "@/lib/scrapers/types";

/** Remove acentos, espaços duplicados e normaliza caixa — base para comparações. */
export function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Converte uma lista textual (uma por linha ou separada por vírgula) em array limpo. */
export function parseList(value: string): string[] {
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** Campos que identificam um concurso independentemente do site de origem. */
export function contentHashInput(contest: Partial<RawContest>): string {
  return [
    normalizeText(contest.organization),
    normalizeText(contest.role ?? contest.title),
    normalizeText(contest.city),
    normalizeText(contest.state),
    normalizeText(contest.registrationEndsAt),
    String(contest.vacancies ?? ""),
  ].join("|");
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** SHA-256 dos campos normalizados: detecta o mesmo concurso vindo de sites diferentes. */
export async function contentHash(contest: Partial<RawContest>): Promise<string> {
  const data = new TextEncoder().encode(contentHashInput(contest));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}
