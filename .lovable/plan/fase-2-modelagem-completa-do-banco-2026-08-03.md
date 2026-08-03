# Fase 2 — Modelagem completa do banco

Objetivo: criar todas as tabelas restantes, índices, RLS e as regras anti-duplicidade que sustentam as fases 3 a 7. Nenhum scraper ou envio de notificação nesta fase.

## Entregas

1. **Script SQL `supabase/fase-2.sql`** para você executar no SQL Editor do seu projeto Supabase (mesmo fluxo da Fase 1), contendo todas as tabelas abaixo com GRANTs, RLS e políticas.
2. **Tipos TypeScript** em `src/lib/db/types.ts` espelhando o schema (sem geração automática, já que o projeto usa Supabase externo).
3. **Helpers de acesso tipados** em `src/lib/db/` (consultas básicas de filtros e histórico), usados nas fases seguintes.
4. **Página `/filtros`** protegida: formulário para o usuário salvar cidades, cargos, palavras-chave desejadas/bloqueadas e regras de descarte — primeira tela que grava nas novas tabelas, servindo de validação real do schema.
5. **Testes** (vitest) para as funções puras de normalização e cálculo de `content_hash`.

## Tabelas

| Tabela | Conteúdo | Acesso |
|---|---|---|
| `contests` | órgão, cargo, salário, vagas, cadastro reserva, escolaridade, requisitos, cidade, estado, banca, data publicação, fim das inscrições, situação, link edital, link notícia, `source`, `source_id`, `content_hash` | leitura para usuários autenticados; escrita só service_role |
| `user_filters` | cidades, cargos, palavras-chave desejadas, palavras bloqueadas, exigir/descartar CNH, descartar pós obrigatória, somente TI, ativo | dono (`auth.uid()`) lê e escreve |
| `sent_notifications` | user_id, contest_id, canal (`email`/`whatsapp`), enviado_em, status | dono lê; escrita service_role |
| `query_history` | source, executado_em, itens encontrados, itens novos, status, duração | dono/admin lê; escrita service_role |
| `execution_logs` | nível, etapa, mensagem, contexto jsonb, duração, erro | somente admin lê; escrita service_role |

## Regras anti-duplicidade

- `unique (source, source_id)` em `contests` — o mesmo edital do mesmo site nunca entra duas vezes.
- `content_hash` (SHA-256 dos campos normalizados) com índice — detecta o mesmo concurso publicado em sites diferentes ou republicado.
- `unique (user_id, contest_id, channel)` em `sent_notifications` — nenhum usuário recebe o mesmo concurso duas vezes no mesmo canal.
- Trigger `updated_at` automático nas tabelas mutáveis.

## Índices

`contests`: `city, state`, `published_at desc`, `registration_ends_at`, `content_hash`, índice GIN de busca textual em título/cargo/requisitos.
`sent_notifications`: `(user_id, sent_at desc)`. `query_history`: `(source, executed_at desc)`.

## Detalhes técnicos

- Todas as tabelas em `public` seguem a ordem obrigatória: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`.
- Sem acesso `anon`: todo o conteúdo exige sessão autenticada.
- Papéis continuam em `user_roles` via `public.has_role()` (criado na Fase 1) nas políticas de admin.
- As leituras da UI usam o client do navegador com RLS; a ingestão das fases seguintes usará chave de serviço em server functions.

## Fora do escopo desta fase

Scrapers, motor de filtros (Fase 4), relatórios, envio de e-mail/WhatsApp e agendamento.

Aprovando, executo a Fase 2 e entrego o `supabase/fase-2.sql` para você rodar.
