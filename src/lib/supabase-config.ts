/**
 * Configuração do Supabase (projeto gratuito na conta do usuário).
 *
 * COMO CONFIGURAR (uma única vez):
 * 1. Crie uma conta gratuita em https://supabase.com e um novo projeto.
 * 2. No painel do projeto, abra Settings -> API.
 * 3. Copie "Project URL" e a chave "anon / publishable" e cole abaixo (ou em .env).
 *
 * A chave anon é pública por natureza (pode ficar no código): o acesso aos
 * dados é controlado por Row Level Security no banco.
 *
 * As variáveis VITE_* do arquivo .env têm prioridade; valores vazios são
 * ignorados (não sobrescrevem os valores abaixo com string vazia).
 */

/** Lê uma variável de import.meta.env, tratando valor vazio como "não definido". */
function envVar(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export const SUPABASE_URL = envVar("VITE_SUPABASE_URL") ?? "https://amzmpidwgwqezodvrcfe.supabase.co";

export const SUPABASE_ANON_KEY =
  envVar("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  envVar("VITE_SUPABASE_ANON_KEY") ??
  "sb_publishable_T3J2pA5AMD3uCHRUYPHnQQ_kd3RIHZM";

export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("COLE_AQUI") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("COLE_AQUI")
  );
}
