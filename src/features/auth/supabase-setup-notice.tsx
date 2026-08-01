import { AlertTriangle } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase-config";

/** Aviso exibido enquanto as credenciais do Supabase não forem preenchidas. */
export function SupabaseSetupNotice() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-left text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium text-foreground">Banco de dados ainda não conectado</p>
        <p className="text-muted-foreground">
          Crie um projeto gratuito no Supabase e cole a URL e a chave anon em{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">src/lib/supabase-config.ts</code>.
          Depois execute o SQL de{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">supabase/fase-1.sql</code> no SQL
          Editor do seu projeto.
        </p>
      </div>
    </div>
  );
}
