import { describe, expect, it, vi } from "vitest";

import { ScraperError, kindFromStatus, toScraperError } from "@/lib/scrapers/base/errors";
import { buildReport, summarizeReport } from "@/lib/scrapers/base/result";
import type { ContestScraper } from "@/lib/scrapers/base/scraper.interface";
import { runAllScrapers, runScraper, runSingleScraper } from "@/lib/scrapers/manager";
import { clearScrapers, listEnabledScrapers, registerScraper } from "@/lib/scrapers/registry";

const params = { since: "2026-01-01T00:00:00.000Z" };

function fakeScraper(source: string, impl: ContestScraper["fetchList"]): ContestScraper {
  return {
    source,
    displayName: source.toUpperCase(),
    baseUrl: `https://${source}.test`,
    minIntervalMs: 0,
    fetchList: impl,
  };
}

describe("erros de scraper", () => {
  it("classifica status HTTP", () => {
    expect(kindFromStatus(403)).toBe("blocked");
    expect(kindFromStatus(429)).toBe("blocked");
    expect(kindFromStatus(504)).toBe("timeout");
    expect(kindFromStatus(500)).toBe("network");
  });

  it("converte erros desconhecidos preservando ScraperError", () => {
    const original = new ScraperError("parse", "pci", "html inesperado");
    expect(toScraperError("pci", original)).toBe(original);
    const converted = toScraperError("pci", new Error("request timeout"), "https://x.test");
    expect(converted.kind).toBe("timeout");
    expect(converted.url).toBe("https://x.test");
  });
});

describe("gerenciador de scrapers", () => {
  it("executa um scraper com sucesso", async () => {
    const result = await runScraper(
      fakeScraper("ok", async () => [{ sourceId: "1", title: "Concurso" }]),
      params,
    );
    expect(result.ok).toBe(true);
    expect(result.itemCount).toBe(1);
  });

  it("isola falhas: um site quebrado não interrompe os demais", async () => {
    const report = await runAllScrapers(params, {
      scrapers: [
        fakeScraper("a", async () => [{ sourceId: "1", title: "A" }]),
        fakeScraper("b", async () => {
          throw new ScraperError("parse", "b", "estrutura mudou");
        }),
        fakeScraper("c", async () => [{ sourceId: "2", title: "C" }]),
      ],
    });
    expect(report.scrapersRun).toBe(3);
    expect(report.totalItems).toBe(2);
    expect(report.succeeded).toEqual(["a", "c"]);
    expect(report.failed).toEqual(["b"]);
    expect(report.results[1]?.error?.kind).toBe("parse");
  });

  it("aplica timeout por site", async () => {
    const result = await runScraper(
      fakeScraper("lento", () => new Promise(() => {})),
      params,
      { timeoutMs: 10 },
    );
    expect(result.ok).toBe(false);
    expect(result.error?.kind).toBe("timeout");
  });

  it("mantém a ordem de execução", async () => {
    const order: string[] = [];
    await runAllScrapers(params, {
      scrapers: ["a", "b", "c"].map((s) =>
        fakeScraper(s, async () => {
          order.push(s);
          return [];
        }),
      ),
    });
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("executa um único site pelo identificador", async () => {
    const spy = vi.fn(async () => []);
    const report = await runSingleScraper("alvo", params, {
      scrapers: [fakeScraper("outro", async () => []), fakeScraper("alvo", spy)],
    });
    expect(spy).toHaveBeenCalledOnce();
    expect(report.scrapersRun).toBe(1);
  });

  it("gera relatório válido sem nenhum scraper registrado", async () => {
    clearScrapers();
    const report = await runAllScrapers(params);
    expect(report.scrapersRun).toBe(0);
    expect(report.totalItems).toBe(0);
    expect(summarizeReport(report)).toContain("0 coletor(es)");
  });
});

describe("registry como sistema de plugins", () => {
  it("ignora scrapers desabilitados", () => {
    clearScrapers();
    registerScraper({ ...fakeScraper("on", async () => []) });
    registerScraper({ ...fakeScraper("off", async () => []), enabled: false });
    expect(listEnabledScrapers().map((s) => s.source)).toEqual(["on"]);
    clearScrapers();
  });
});

describe("relatório", () => {
  it("agrega contagens e duração", () => {
    const report = buildReport(
      [
        {
          source: "a",
          displayName: "A",
          ok: true,
          items: [],
          itemCount: 3,
          durationMs: 5,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
        },
      ],
      new Date().toISOString(),
    );
    expect(report.totalItems).toBe(3);
    expect(report.durationMs).toBeGreaterThanOrEqual(0);
  });
});
