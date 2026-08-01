import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir nova senha — Radar Concursos TI" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta do Radar Concursos TI.",
      },
      { property: "og:title", content: "Definir nova senha" },
      {
        property: "og:description",
        content: "Página de redefinição de senha do Radar Concursos TI.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      toast.error("Conecte seu projeto Supabase antes de usar a autenticação.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso.");
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="radar-grid flex min-h-screen items-center justify-center px-4 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <h1 className="text-xl font-semibold">Definir nova senha</h1>
        <p className="text-sm text-muted-foreground">
          Abra esta página pelo link enviado ao seu e-mail para que a alteração seja aceita.
        </p>
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </main>
  );
}
