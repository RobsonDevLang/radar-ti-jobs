# Radar Concursos TI — Arquitetura e Plano de Fases

Aplicação web que monitora concursos públicos de TI, filtra por cidade/cargo e notifica o usuário por e-mail e WhatsApp.

## Ajustes de stack (importante)

A stack pedida (Node/Express + Prisma + Docker) não é executável nesta plataforma, e o Lovable Cloud fica de fora por sua escolha. O backend será o **Supabase na sua própria conta (plano free)**, conectado ao projeto pela integração Supabase — sem custo e com os dados sob seu controle.

| Pedido | Nesta plataforma |
|---|---|
| React + TypeScript + Tailwind | Igual (TanStack Start) |
| Node.js + API REST | Server functions e rotas `/api/*` (mesmo runtime de servidor) |
| PostgreSQL (Supabase) | Seu projeto Supabase gratuito (500 MB, suficiente para as fases) |
| Prisma ORM | Migrations SQL versionadas + client tipado gerado |
| JWT | Supabase Auth (JWT) + RLS por usuário |
| Docker | Deploy gerenciado (sem container manual) |
| Cron diário 09:00 | `pg_cron` gratuito no seu Supabase chamando a rota `/api/public/cron/daily` |

O que você precisa fazer uma única vez na Fase 1: criar conta em supabase.com, criar um projeto e conectá-lo aqui. Eu cuido de migrations, auth e código.

Limites do plano free a considerar: projeto pausa após ~1 semana sem uso (basta reativar), e-mails de autenticação têm baixa cota (na Fase 6 usaremos um provedor de e-mail próprio com plano free, ex.: Resend 3.000 e-mails/mês).

Tudo o mais (camadas, scrapers plugáveis, retry, cache, rate limit, logs, testes) é mantido.


## Arquitetura

```text
Browser (React + Tailwind)
   |  rotas: /auth  /dashboard  /concursos  /filtros  /historico
   v
Camada de servidor (server functions + /api/public/*)
   |-- services/    regras de negócio (matching, relatório, dedupe)
   |-- scrapers/    1 arquivo por site, registrados num registry
   |-- notifiers/   email (SMTP|Resend|SendGrid), whatsapp (Meta|Evolution)
   |-- lib/         http client com retry+rate limit, cache, logger
   v
Postgres (RLS por usuário) + Storage + Agendador diário
```

Contratos que garantem extensibilidade:
- `ContestScraper { source, fetchList(since), parseDetail(url) }` — novo site = 1 arquivo + 1 linha no registry.
- `EmailProvider` / `WhatsAppProvider` — troca por variável de ambiente.

## Estrutura de pastas

```text
src/
  routes/            páginas + /api/public/cron, /api/public/webhooks
  components/        UI reutilizável (cards, tabelas, formulários)
  features/          auth, filters, contests, notifications (UI + hooks)
  lib/
    scrapers/        registry.ts, pci.ts, ache.ts, jc.ts, ...
    notifiers/       email/*, whatsapp/*
    services/        matching.ts, report.ts, ingest.ts
    core/            http.ts (retry/rate-limit), cache.ts, logger.ts
  lib/email-templates/  templates React Email
  tests/             testes unitários (vitest)
```

## Modelagem do banco

- `profiles` — dados do usuário (e-mail, whatsapp, cidade, estado, horário de envio, modo diário/novidades).
- `user_roles` — papéis em tabela separada (segurança).
- `contests` — órgão, cargo, salário, vagas, cadastro reserva, escolaridade, requisitos, cidade, estado, banca, data publicação, data fim inscrição, situação, link edital, link notícia, `source`, `source_id`, `content_hash`. Único em (`source`,`source_id`) e índice em `content_hash` para evitar duplicados.
- `user_filters` — cidades, cargos, palavras-chave desejadas/bloqueadas, regras de descarte (CNH, pós obrigatória).
- `sent_notifications` — (user_id, contest_id, canal) único: nunca reenviar.
- `query_history` — cada consulta a cada site (quando, quantos itens, status).
- `execution_logs` — logs estruturados de execução (nível, etapa, duração, erro).

## Fluxo

1. Usuário cadastra-se, confirma e-mail, define filtros.
2. Primeira execução: varre os últimos 6 meses em todos os sites.
3. Ingestão: normaliza → deduplica por hash → grava.
4. Matching: aplica cidade (Porto Alegre inicialmente), cargos de TI, palavras bloqueadas; descarta CNH obrigatória, pós obrigatória e não-TI.
5. Relatório: monta itens ainda não enviados àquele usuário.
6. Notificação: e-mail + WhatsApp; grava em `sent_notifications`.
7. Diariamente 09:00: repete só com novidades; sem novidades, não envia nada.

## APIs

Internas: `signup/login/reset`, `getContests`, `getFilters/saveFilters`, `getHistory`, `runIngestion` (admin), `sendTestNotification`.
Públicas: `POST /api/public/cron/daily` (token), `POST /api/public/webhooks/whatsapp`.
Externas: sites de concursos (API oficial quando existir, senão scraping com rate limit), Resend/SendGrid/SMTP, Meta Cloud API/Evolution API.

## Cronograma das fases

| Fase | Entrega | Aprovação |
|---|---|---|
| 1 | Estrutura front/back, banco configurado, auth (cadastro, login, recuperação de senha), ambiente | necessária |
| 2 | Todas as tabelas, índices, RLS, regras anti-duplicidade | necessária |
| 3 | Módulo de coleta + scrapers dos 8 sites | necessária |
| 4 | Motor de filtros (Porto Alegre, cargos de TI, descartes) | necessária |
| 5 | Primeira execução (6 meses) + relatório completo + controle de enviados | necessária |
| 6 | Notificações e-mail e WhatsApp com provedores trocáveis | necessária |
| 7 | Agendamento diário às 09:00 apenas com novidades | necessária |

## Fase 1 — escopo exato desta próxima etapa

- Ativar Lovable Cloud (banco + auth).
- Tabela `profiles` + trigger de criação no cadastro; `user_roles`.
- Páginas: landing `/`, `/auth` (cadastro + login), `/reset-password`, `/dashboard` protegido.
- Identidade visual própria (tokens semânticos, sem gradiente roxo genérico), pt-BR.
- Camadas base vazias porém tipadas: `core/http`, `core/logger`, `core/cache`, `scrapers/registry`, `notifiers/*` (interfaces).
- Vitest configurado com testes dos utilitários.
- Nenhum scraper nesta fase.

Aguardo sua aprovação para executar a Fase 1.
