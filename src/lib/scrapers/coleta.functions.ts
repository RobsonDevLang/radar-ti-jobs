import { createServerFn } from "@tanstack/react-start";

import { runAllScrapers } from "@/lib/scrapers/manager";
import { PLANNED_SOURCES, listScrapers } from "@/lib/scrapers/registry";

export const listCollectionSources = createServerFn({ method: "GET" }).handler(async () => {
  const registered = listScrapers().map((s) => ({
    source: s.source,
    displayName: s.displayName,
    baseUrl: s.baseUrl,
    enabled: s.enabled !== false,
  }));
  return { planned: [...PLANNED_SOURCES], registered };
});

export const runCollection = createServerFn({ method: "POST" })
  .inputValidator((input: { sinceDays?: number } | undefined) => ({
    sinceDays: Math.min(Math.max(input?.sinceDays ?? 30, 1), 365),
  }))
  .handler(async ({ data }) => {
    const since = new Date(Date.now() - data.sinceDays * 86_400_000).toISOString();
    const report = await runAllScrapers({ since });
    // Na Fase 3 não gravamos nada: apenas o relatório da execução.
    return { ...report, results: report.results.map(({ items: _items, ...rest }) => rest) };
  });
