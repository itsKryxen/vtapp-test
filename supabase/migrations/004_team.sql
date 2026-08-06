-- ============================================================================
-- V-TAPP 2026 - migration 004: core team page.
-- Run in the Supabase SQL editor after schema.sql. Safe to re-run.
-- ============================================================================

create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 80),
  role        text not null check (char_length(role) between 2 and 80),
  department  text not null default 'Core',
  photo_url   text,
  email       text,
  linkedin    text,
  instagram   text,
  sort_order  int not null default 100,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists team_dept_idx   on public.team_members (department, sort_order);
create index if not exists team_active_idx on public.team_members (is_active);

create or replace function public.team_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists team_touch_trg on public.team_members;
create trigger team_touch_trg
  before update on public.team_members
  for each row execute function public.team_touch();

-- ------------------------------------------------------------------ RLS ----
alter table public.team_members enable row level security;

drop policy if exists team_public_read on public.team_members;
create policy team_public_read on public.team_members for select
  using (is_active);

drop policy if exists team_admin_all on public.team_members;
create policy team_admin_all on public.team_members for all
  using (public.is_admin()) with check (public.is_admin());

-- Photos live at posters/team/<uuid>.webp. Migration 003 already added the
-- admin storage insert/update policies this needs.
