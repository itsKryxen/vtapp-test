-- ============================================================================
-- V-TAPP 2026, migration 003: sponsors.
-- Run in the Supabase SQL editor after schema.sql. Safe to re-run.
-- ============================================================================

do $$ begin
  create type sponsor_tier as enum ('title','gold','silver','bronze','partner');
exception when duplicate_object then null; end $$;

create table if not exists public.sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 80),
  tier        sponsor_tier not null default 'partner',
  logo_url    text,
  website     text,
  blurb       text check (char_length(blurb) <= 240),
  sort_order  int not null default 100,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sponsors_tier_idx   on public.sponsors (tier, sort_order);
create index if not exists sponsors_active_idx on public.sponsors (is_active);

create or replace function public.sponsors_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists sponsors_touch_trg on public.sponsors;
create trigger sponsors_touch_trg
  before update on public.sponsors
  for each row execute function public.sponsors_touch();

-- ------------------------------------------------------------------ RLS ----
alter table public.sponsors enable row level security;

-- The public sees active sponsors only.
drop policy if exists sponsors_public_read on public.sponsors;
create policy sponsors_public_read on public.sponsors for select
  using (is_active);

-- The core team sees and manages everything.
drop policy if exists sponsors_admin_all on public.sponsors;
create policy sponsors_admin_all on public.sponsors for all
  using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------- storage ----
-- Sponsor logos live at posters/sponsors/<uuid>.webp. The existing storage
-- policies scope writes to a club's own folder (first path segment = club id),
-- which admins do not have, so admins get their own write policies here.
drop policy if exists posters_admin_insert on storage.objects;
create policy posters_admin_insert on storage.objects for insert
  with check (bucket_id = 'posters' and public.is_admin());

drop policy if exists posters_admin_update on storage.objects;
create policy posters_admin_update on storage.objects for update
  using (bucket_id = 'posters' and public.is_admin());

-- (posters_club_delete in schema.sql already lets admins delete.)
