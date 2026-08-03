-- Radar Concursos TI — Fase 2
-- Modelagem completa: tabelas, índices, RLS e regras anti-duplicidade.
-- Execute no SQL Editor do seu projeto Supabase, depois do script da Fase 1.

-- 0. Utilitário: updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. Concursos
create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  title text not null,
  organization text,
  role text,
  salary text,
  salary_max numeric,
  vacancies integer,
  talent_pool boolean not null default false,
  education text,
  requirements text,
  city text,
  state text,
  exam_board text,
  published_at date,
  registration_ends_at date,
  status text,
  official_url text,
  news_url text,
  content_hash text not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);

grant select on public.contests to authenticated;
grant all on public.contests to service_role;
alter table public.contests enable row level security;

drop policy if exists "concursos - leitura autenticada" on public.contests;
create policy "concursos - leitura autenticada"
  on public.contests for select to authenticated using (true);

create index if not exists contests_city_state_idx on public.contests (city, state);
create index if not exists contests_published_at_idx on public.contests (published_at desc);
create index if not exists contests_registration_ends_idx on public.contests (registration_ends_at);
create index if not exists contests_content_hash_idx on public.contests (content_hash);
create index if not exists contests_search_idx on public.contests
  using gin (to_tsvector('portuguese',
    coalesce(title,'') || ' ' || coalesce(role,'') || ' ' || coalesce(requirements,'')));

drop trigger if exists contests_set_updated_at on public.contests;
create trigger contests_set_updated_at before update on public.contests
  for each row execute function public.set_updated_at();

-- 2. Filtros do usuário
create table if not exists public.user_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Meu filtro',
  cities text[] not null default array['Porto Alegre'],
  states text[] not null default array['RS'],
  roles text[] not null default array[]::text[],
  keywords text[] not null default array[]::text[],
  blocked_keywords text[] not null default array[]::text[],
  discard_requires_cnh boolean not null default true,
  discard_requires_postgrad boolean not null default true,
  only_it boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.user_filters to authenticated;
grant all on public.user_filters to service_role;
alter table public.user_filters enable row level security;

drop policy if exists "filtros proprios - select" on public.user_filters;
create policy "filtros proprios - select"
  on public.user_filters for select to authenticated using (auth.uid() = user_id);

drop policy if exists "filtros proprios - insert" on public.user_filters;
create policy "filtros proprios - insert"
  on public.user_filters for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "filtros proprios - update" on public.user_filters;
create policy "filtros proprios - update"
  on public.user_filters for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "filtros proprios - delete" on public.user_filters;
create policy "filtros proprios - delete"
  on public.user_filters for delete to authenticated using (auth.uid() = user_id);

create index if not exists user_filters_user_idx on public.user_filters (user_id, active);

drop trigger if exists user_filters_set_updated_at on public.user_filters;
create trigger user_filters_set_updated_at before update on public.user_filters
  for each row execute function public.set_updated_at();

-- 3. Notificações enviadas (nunca reenviar)
do $$ begin
  create type public.notification_channel as enum ('email', 'whatsapp');
exception when duplicate_object then null; end $$;

create table if not exists public.sent_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contest_id uuid not null references public.contests(id) on delete cascade,
  channel public.notification_channel not null,
  status text not null default 'sent',
  provider_id text,
  error text,
  sent_at timestamptz not null default now(),
  unique (user_id, contest_id, channel)
);

grant select on public.sent_notifications to authenticated;
grant all on public.sent_notifications to service_role;
alter table public.sent_notifications enable row level security;

drop policy if exists "envios proprios - select" on public.sent_notifications;
create policy "envios proprios - select"
  on public.sent_notifications for select to authenticated using (auth.uid() = user_id);

create index if not exists sent_notifications_user_idx
  on public.sent_notifications (user_id, sent_at desc);

-- 4. Histórico de consultas aos sites
create table if not exists public.query_history (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  executed_at timestamptz not null default now(),
  items_found integer not null default 0,
  items_new integer not null default 0,
  status text not null default 'ok',
  duration_ms integer,
  error text
);

grant select on public.query_history to authenticated;
grant all on public.query_history to service_role;
alter table public.query_history enable row level security;

drop policy if exists "historico - leitura autenticada" on public.query_history;
create policy "historico - leitura autenticada"
  on public.query_history for select to authenticated using (true);

create index if not exists query_history_source_idx
  on public.query_history (source, executed_at desc);

-- 5. Logs de execução (somente admin lê)
do $$ begin
  create type public.log_level as enum ('debug', 'info', 'warn', 'error');
exception when duplicate_object then null; end $$;

create table if not exists public.execution_logs (
  id uuid primary key default gen_random_uuid(),
  level public.log_level not null default 'info',
  stage text not null,
  message text not null,
  context jsonb,
  duration_ms integer,
  error text,
  created_at timestamptz not null default now()
);

grant select on public.execution_logs to authenticated;
grant all on public.execution_logs to service_role;
alter table public.execution_logs enable row level security;

drop policy if exists "logs - somente admin" on public.execution_logs;
create policy "logs - somente admin"
  on public.execution_logs for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create index if not exists execution_logs_created_idx
  on public.execution_logs (created_at desc);
