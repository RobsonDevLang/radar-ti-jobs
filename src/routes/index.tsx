import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Filter, Radar, ShieldCheck, Sparkles } from "lucide-react";

import { SupabaseSetupNotice } from "@/features/auth/supabase-setup-notice";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radar Concursos TI — Alertas de concursos de TI em Porto Alegre" },
      {
        name: "description",
        content:
          "Monitore automaticamente concursos públicos de TI e receba alertas por e-mail e WhatsApp assim que surgirem vagas compatíveis com seu perfil.",
      },
      { property: "og:title", content: "Radar Concursos TI" },
      {
        property: "og:description",
        content:
          "Alertas automáticos de concursos públicos de Tecnologia da Informação por e-mail e WhatsApp.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Radar,
    title: "Monitoramento diário",
    text: "Varredura automática dos principais portais de concursos todos os dias às 09:00.",
  },
  {
    icon: Filter,
    title: "Filtros de TI",
    text: "Somente cargos de tecnologia, na sua cidade, sem exigências que você não atende.",
  },
  {
    icon: Bell,
    title: "E-mail e WhatsApp",
    text: "Você recebe apenas as novidades — nada de repetir concursos já enviados.",
  },
  {
    icon: ShieldCheck,
    title: "Dados sob seu controle",
    text: "Banco PostgreSQL na sua própria conta, com autenticação JWT e RLS por usuário.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen">
      <section className="radar-grid border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Fase 1 · estrutura e autenticação
          </span>
          <h1 className="mt-6 text-4xl font-bold text-balance sm:text-6xl">
            Radar Concursos TI
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Vigilância automática de concursos públicos para profissionais de Tecnologia da
            Informação. Você define os filtros, o radar avisa quando surgir a vaga certa.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Criar conta gratuita</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ modo: "login" }}>
                Entrar
              </Link>
            </Button>
          </div>
          <div className="mt-10 w-full max-w-xl">
            <SupabaseSetupNotice />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold">O que o radar faz por você</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Radar Concursos TI · desenvolvido em fases
      </footer>
    </main>
  );
}
