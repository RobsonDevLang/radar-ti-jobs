-- Radar Concursos TI — Fase 1
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Papéis de usuário (nunca guardar papel na tabela de perfil)
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "usuario le seus papeis" on public.user_roles;
create policy "usuario le seus papeis"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- 2. Perfil do usuário
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  whatsapp text,
  city text not null default 'Porto Alegre',
  state text not null default 'RS',
  send_hour smallint not null default 9,
  daily_report boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "perfil proprio - select" on public.profiles;
create policy "perfil proprio - select"
  on public.profiles for select to authenticated using (auth.uid() = id);

drop policy if exists "perfil proprio - insert" on public.profiles;
create policy "perfil proprio - insert"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "perfil proprio - update" on public.profiles;
create policy "perfil proprio - update"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- 3. Criação automática do perfil no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
