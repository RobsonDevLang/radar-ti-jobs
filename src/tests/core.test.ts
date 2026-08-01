import { describe, expect, it, vi } from "vitest";

import { TtlCache } from "@/lib/core/cache";
import { RateLimiter, backoffDelay, withRetry } from "@/lib/core/http";
import { buildLogEntry } from "@/lib/core/logger";
import { PLANNED_SOURCES, getScraper, listScrapers, registerScraper } from "@/lib/scrapers/registry";

describe("TtlCache", () => {
  it("retorna valor dentro do TTL e expira depois", () => {
    let now = 0;
    const cache = new TtlCache<string>(1000, () => now);
    cache.set("a", "valor");
    expect(cache.get("a")).toBe("valor");
    now = 1500;
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size).toBe(0);
  });
});

describe("withRetry", () => {
  it("tenta novamente e retorna sucesso", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error("falha temporária");
        return "ok";
      },
      { attempts: 3, sleep: async () => {} },
    );
    expect(result).toBe("ok");
    expect(calls).toBe(3);
  });

  it("propaga o erro após esgotar as tentativas", async () => {
    await expect(
      withRetry(
        async () => {
          throw new Error("sempre falha");
        },
        { attempts: 2, sleep: async () => {} },
      ),
    ).rejects.toThrow("sempre falha");
  });

  it("aplica backoff exponencial limitado", () => {
    expect(backoffDelay(1, 500, 8000)).toBe(500);
    expect(backoffDelay(2, 500, 8000)).toBe(1000);
    expect(backoffDelay(10, 500, 8000)).toBe(8000);
  });
});

describe("RateLimiter", () => {
  it("aguarda o intervalo mínimo entre chamadas", async () => {
    let now = 0;
    const sleep = vi.fn(async (ms: number) => {
      now += ms;
    });
    const limiter = new RateLimiter(1000, () => now, sleep);
    await limiter.acquire();
    await limiter.acquire();
    expect(sleep).toHaveBeenCalledWith(1000);
  });
});

describe("logger", () => {
  it("gera entrada estruturada", () => {
    const entry = buildLogEntry("info", "ingest", "iniciado", { source: "pci" });
    expect(entry.level).toBe("info");
    expect(entry.scope).toBe("ingest");
    expect(entry.context).toEqual({ source: "pci" });
    expect(new Date(entry.timestamp).toString()).not.toBe("Invalid Date");
  });
});

describe("registry de scrapers", () => {
  it("começa vazio na Fase 1 e prevê 8 sites", () => {
    expect(listScrapers()).toHaveLength(0);
    expect(PLANNED_SOURCES).toHaveLength(8);
  });

  it("registra e recupera um scraper", () => {
    registerScraper({
      source: "teste",
      displayName: "Teste",
      baseUrl: "https://exemplo.com",
      minIntervalMs: 1000,
      fetchList: async () => [],
    });
    expect(getScraper("teste")?.displayName).toBe("Teste");
    expect(() =>
      registerScraper({
        source: "teste",
        displayName: "Teste",
        baseUrl: "https://exemplo.com",
        minIntervalMs: 1000,
        fetchList: async () => [],
      }),
    ).toThrow();
  });
});
