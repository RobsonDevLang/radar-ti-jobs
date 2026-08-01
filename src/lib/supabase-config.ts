/**
 * Configuração do Supabase (projeto gratuito na conta do usuário).
 *
 * COMO CONFIGURAR (uma única vez):
 * 1. Crie uma conta gratuita em https://supabase.com e um novo projeto.
 * 2. No painel do projeto, abra Settings -> API.
 * 3. Copie "Project URL" e a chave "anon / publishable" e cole abaixo.
 *
 * A chave anon é pública por natureza (pode ficar no código): o acesso aos
 * dados é controlado por Row Level Security no banco.
 */
export const SUPABASE_URL =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ?? "COLE_AQUI_A_URL_DO_PROJETO";

export const SUPABASE_ANON_KEY =
  (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined) ??
  (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined) ??
  "COLE_AQUI_A_CHAVE_ANON";

export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.startsWith("COLE_AQUI")
  );
}
