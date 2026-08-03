import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/auth-context";
import { getUserFilter, saveUserFilter } from "@/lib/db/queries";
import { parseList } from "@/lib/db/normalize";

export const Route = createFileRoute("/_authenticated/filtros")({
  head: () => ({
    meta: [
      { title: "Filtros de concursos — Radar Concursos TI" },
      {
        name: "description",
        content:
          "Defina cidades, cargos, palavras-chave e regras de descarte para receber apenas concursos de TI relevantes.",
      },
      { property: "og:title", content: "Filtros do Radar Concursos TI" },
      {
        property: "og:description",
        content: "Configure cidades, cargos e regras de descarte do seu monitoramento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FiltrosPage,
});

function FiltrosPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-filter", userId],
    queryFn: () => getUserFilter(userId),
    enabled: Boolean(userId),
  });

  const [cities, setCities] = useState("Porto Alegre");
  const [states, setStates] = useState("RS");
  const [roles, setRoles] = useState("");
  const [keywords, setKeywords] = useState("");
  const [blocked, setBlocked] = useState("");
  const [discardCnh, setDiscardCnh] = useState(true);
  const [discardPostgrad, setDiscardPostgrad] = useState(true);
  const [onlyIt, setOnlyIt] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setCities(data.cities.join(", "));
    setStates(data.states.join(", "));
    setRoles(data.roles.join("\n"));
    setKeywords(data.keywords.join("\n"));
    setBlocked(data.blocked_keywords.join("\n"));
    setDiscardCnh(data.discard_requires_cnh);
    setDiscardPostgrad(data.discard_requires_postgrad);
    setOnlyIt(data.only_it);
  }, [data]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await saveUserFilter(
        userId,
        {
          cities: parseList(cities),
          states: parseList(states),
          roles: parseList(roles),
          keywords: parseList(keywords),
          blocked_keywords: parseList(blocked),
          discard_requires_cnh: discardCnh,
          discard_requires_postgrad: discardPostgrad,
          only_it: onlyIt,
          active: true,
        },
        data?.id,
      );
      await queryClient.invalidateQueries({ queryKey: ["user-filter", userId] });
      toast.success("Filtros salvos.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar os filtros.");
    } finally {
      setSaving(false);
    }
  };

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
          <Filter className="h-6 w-6 text-primary" aria-hidden /> Filtros
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estas regras definem quais concursos serão coletados e notificados a partir da Fase 4.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Não foi possível carregar seus filtros. Verifique se o script{" "}
          <code>supabase/fase-2.sql</code> foi executado no seu projeto Supabase.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cidades">Cidades</Label>
            <Input
              id="cidades"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder="Porto Alegre, Canoas"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estados">Estados (UF)</Label>
            <Input
              id="estados"
              value={states}
              onChange={(e) => setStates(e.target.value)}
              placeholder="RS"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargos">Cargos de interesse (um por linha)</Label>
          <Textarea
            id="cargos"
            rows={4}
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
            placeholder={"Analista de Sistemas\nTécnico em Informática\nDesenvolvedor"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="palavras">Palavras-chave desejadas</Label>
            <Textarea
              id="palavras"
              rows={4}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={"tecnologia da informação\nsuporte\nbanco de dados"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloqueadas">Palavras bloqueadas</Label>
            <Textarea
              id="bloqueadas"
              rows={4}
              value={blocked}
              onChange={(e) => setBlocked(e.target.value)}
              placeholder={"professor\nenfermagem\nmotorista"}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <ToggleRow
            id="cnh"
            label="Descartar vagas que exigem CNH"
            checked={discardCnh}
            onChange={setDiscardCnh}
          />
          <ToggleRow
            id="pos"
            label="Descartar vagas com pós-graduação obrigatória"
            checked={discardPostgrad}
            onChange={setDiscardPostgrad}
          />
          <ToggleRow
            id="ti"
            label="Somente cargos de Tecnologia da Informação"
            checked={onlyIt}
            onChange={setOnlyIt}
          />
        </div>

        <Button type="submit" disabled={saving || isLoading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Salvar filtros
        </Button>
      </form>
    </main>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
