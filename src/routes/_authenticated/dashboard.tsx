import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Database, Filter, LogOut, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { getSupabase } from "@/lib/supabase";
import { PLANNED_SOURCES, listScrapers } from "@/lib/scrapers/registry";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Radar Concursos TI" },
      {
        name: "description",
        content: "Acompanhe o status do monitoramento de concursos de TI e suas configurações.",
      },
      { property: "og:title", content: "Painel do Radar Concursos TI" },
      {
        property: "og:description",
        content: "Status do monitoramento, filtros e notificações da sua conta.",
      },
    ],
  }),
  component: Dashboard,
});

const roadmap = [
  { fase: "Fase 1", titulo: "Estrutura, banco e autenticação", status: "Concluída" },
  { fase: "Fase 2", titulo: "Modelagem completa do banco", status: "Próxima" },
  { fase: "Fase 3", titulo: "Coletores dos 8 portais", status: "Planejada" },
  { fase: "Fase 4", titulo: "Mecanismo de filtros", status: "Planejada" },
  { fase: "Fase 5", titulo: "Primeira execução e relatório", status: "Planejada" },
  { fase: "Fase 6", titulo: "Notificações e-mail e WhatsApp", status: "Planejada" },
  { fase: "Fase 7", titulo: "Monitoramento diário às 09:00", status: "Planejada" },
];

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await getSupabase()?.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-primary">
            <Radar className="h-5 w-5" aria-hidden />
            <span className="font-semibold">Radar Concursos TI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" aria-hidden /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section>
          <h1 className="text-2xl font-bold">Painel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A estrutura está pronta. As próximas fases ligam coleta, filtros e notificações.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Database} label="Portais monitorados" value={`0 de ${PLANNED_SOURCES.length}`} />
          <StatCard icon={Filter} label="Filtros ativos" value="—" />
          <StatCard icon={Bell} label="Notificações enviadas" value="0" />
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Roteiro de fases</h2>
          <ul className="mt-4 divide-y divide-border">
            {roadmap.map((item) => (
              <li key={item.fase} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <span className="font-medium text-foreground">{item.fase}</span>{" "}
                  <span className="text-muted-foreground">· {item.titulo}</span>
                </span>
                <span
                  className={
                    item.status === "Concluída"
                      ? "rounded-full bg-success/15 px-2.5 py-0.5 text-xs text-success"
                      : "rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Coletores registrados no momento: {listScrapers().length}
          </p>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
