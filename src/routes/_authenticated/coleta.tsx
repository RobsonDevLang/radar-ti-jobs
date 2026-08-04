import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, PlayCircle, Loader2, Radar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { listCollectionSources, runCollection } from "@/lib/scrapers/coleta.functions";

export const Route = createFileRoute("/_authenticated/coleta")({
  head: () => ({
    meta: [
      { title: "Coleta de concursos — Radar Concursos TI" },
      {
        name: "description",
        content:
          "Acompanhe os coletores registrados, execute a coleta e veja o relatório de erros por portal.",
      },
      { property: "og:title", content: "Coleta do Radar Concursos TI" },
      {
        property: "og:description",
        content: "Gerenciador de coletores: portais previstos, execução e relatório de falhas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ColetaPage,
});

function ColetaPage() {
  const listSources = useServerFn(listCollectionSources);
  const execute = useServerFn(runCollection);

  const { data, isLoading } = useQuery({
    queryKey: ["collection-sources"],
    queryFn: () => listSources(),
  });

  const mutation = useMutation({
    mutationFn: () => execute({ data: { sinceDays: 30 } }),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Falha ao executar a coleta."),
    onSuccess: (report) =>
      toast.success(
        `${report.scrapersRun} coletor(es), ${report.totalItems} item(ns), ${report.failed.length} falha(s).`,
      ),
  });

  const registered = data?.registered ?? [];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar ao painel
        </Link>
        <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold">
          <Radar className="h-6 w-6 text-primary" aria-hidden /> Coleta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A arquitetura de coleta está pronta. Os coletores dos portais entram nas Fases 4 e 5 —
          por isso a execução ainda retorna um relatório vazio.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Portais</h2>
        <ul className="mt-4 divide-y divide-border">
          {(data?.planned ?? []).map((name) => {
            const active = registered.find((r) => r.displayName === name);
            return (
              <li key={name} className="flex items-center justify-between py-3 text-sm">
                <span>{name}</span>
                <span
                  className={
                    active
                      ? "rounded-full bg-success/15 px-2.5 py-0.5 text-xs text-success"
                      : "rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {active ? "Registrado" : "Pendente"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Coletores registrados: {isLoading ? "…" : registered.length}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Executar coleta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Roda o gerenciador com todos os coletores habilitados (últimos 30 dias).
        </p>
        <Button className="mt-4" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <PlayCircle className="h-4 w-4" aria-hidden />
          )}
          Executar coleta
        </Button>

        {mutation.data ? (
          <div className="mt-6 space-y-3 text-sm">
            <p className="text-muted-foreground">
              {mutation.data.scrapersRun} coletor(es) · {mutation.data.totalItems} item(ns) ·{" "}
              {mutation.data.durationMs}ms
            </p>
            {mutation.data.results.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-muted-foreground">
                Nenhum coletor registrado ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {mutation.data.results.map((r) => (
                  <li key={r.source} className="flex items-center justify-between gap-4 p-3">
                    <span>
                      <span className="font-medium">{r.displayName}</span>{" "}
                      <span className="text-muted-foreground">
                        · {r.itemCount} item(ns) · {r.durationMs}ms
                      </span>
                      {r.error ? (
                        <span className="block text-xs text-destructive">
                          [{r.error.kind}] {r.error.message}
                        </span>
                      ) : null}
                    </span>
                    <span className={r.ok ? "text-xs text-success" : "text-xs text-destructive"}>
                      {r.ok ? "OK" : "Falha"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
