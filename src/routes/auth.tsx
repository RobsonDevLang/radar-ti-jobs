import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Radar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupabaseSetupNotice } from "@/features/auth/supabase-setup-notice";
import { useAuth } from "@/features/auth/auth-context";
import { getSupabase } from "@/lib/supabase";

type Modo = "cadastro" | "login" | "recuperar";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { modo?: Modo } => {
    const modo = search['modo'];
    return modo === "login" || modo === "cadastro" || modo === "recuperar" ? { modo } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Radar Concursos TI" },
      {
        name: "description",
        content:
          "Acesse sua conta do Radar Concursos TI para configurar filtros e receber alertas de concursos de TI.",
      },
      { property: "og:title", content: "Acessar o Radar Concursos TI" },
      {
        property: "og:description",
        content: "Cadastro, login e recuperação de senha do Radar Concursos TI.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Modo>(modo ?? "cadastro");

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  return (
    <main className="radar-grid flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary">
            <Radar className="h-6 w-6" aria-hidden />
            <span className="text-lg font-semibold">Radar Concursos TI</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Sua central de alertas</h1>
        </div>

        <SupabaseSetupNotice />

        <div className="rounded-xl border border-border bg-card p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Modo)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="recuperar">Senha</TabsTrigger>
            </TabsList>
            <TabsContent value="cadastro" className="pt-6">
              <SignUpForm />
            </TabsContent>
            <TabsContent value="login" className="pt-6">
              <SignInForm />
            </TabsContent>
            <TabsContent value="recuperar" className="pt-6">
              <ResetForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

function useAuthAction() {
  const [busy, setBusy] = useState(false);

  const run = async (action: (supabase: NonNullable<ReturnType<typeof getSupabase>>) => Promise<void>) => {
    const supabase = getSupabase();
    if (!supabase) {
      toast.error("Conecte seu projeto Supabase antes de usar a autenticação.");
      return;
    }
    setBusy(true);
    try {
      await action(supabase);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    } finally {
      setBusy(false);
    }
  };

  return { busy, run };
}

function SignUpForm() {
  const { busy, run } = useAuthAction();
  const [done, setDone] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async (supabase) => {
      const { error } = await supabase.auth.signUp({
        email: String(form.get("email")),
        password: String(form.get("password")),
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: String(form.get("full_name")) },
        },
      });
      if (error) throw error;
      setDone(true);
      toast.success("Cadastro criado. Confirme o e-mail para ativar a conta.");
    });
  };

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Enviamos um link de confirmação para o seu e-mail. Após confirmar, faça login.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" name="full_name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">E-mail</Label>
        <Input id="signup-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  );
}

function SignInForm() {
  const { busy, run } = useAuthAction();
  const navigate = useNavigate();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async (supabase) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
      void navigate({ to: "/dashboard" });
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input id="login-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

function ResetForm() {
  const { busy, run } = useAuthAction();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async (supabase) => {
      const { error } = await supabase.auth.resetPasswordForEmail(String(form.get("email")), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Se o e-mail existir, enviaremos o link de recuperação.");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Informe seu e-mail e enviaremos um link para definir uma nova senha.
      </p>
      <div className="space-y-2">
        <Label htmlFor="reset-email">E-mail</Label>
        <Input id="reset-email" name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
