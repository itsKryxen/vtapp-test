-- ============================================================================
-- V-TAPP 2026, database schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Safe to re-run: everything is IF NOT EXISTS / OR REPLACE.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums ----
do $$ begin
  create type event_status   as enum ('draft','submitted','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_mode     as enum ('offline','online','hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type team_type      as enum ('solo','team','both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role    as enum ('club','admin');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------- schools ----
create table if not exists public.schools (
  code        text primary key check (code ~ '^[A-Z]{3,10}$'),
  name        text not null,
  short_name  text not null,
  accent      text not null default '#8b5cf6',
  sort_order  int  not null default 100
);

-- ---------------------------------------------------------------- clubs ----
-- Club ID format: VT26_<SCHOOL>_<NNN>   e.g. VT26_SCOPE_001
-- club_index is unique WITHIN a school and is allocated by issue_club_id().
create table if not exists public.clubs (
  id            text primary key
                check (id ~ '^VT26_[A-Z]{3,10}_[0-9]{3}$'),
  school        text not null references public.schools(code) on update cascade,
  club_index    int  not null check (club_index between 1 and 999),
  name          text not null,
  tagline       text,
  logo_url      text,
  contact_name  text not null,
  contact_email text not null,
  contact_phone text,
  instagram     text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (school, club_index),
  -- the ID must actually agree with its own parts
  constraint club_id_matches_parts
    check (id = 'VT26_' || school || '_' || lpad(club_index::text, 3, '0'))
);

create index if not exists clubs_school_idx on public.clubs (school);

-- -------------------------------------------------------- club members ----
-- Links a Supabase auth user to a club. Admins have club_id = null.
create table if not exists public.club_members (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  club_id    text references public.clubs(id) on delete cascade,
  role       member_role not null default 'club',
  full_name  text,
  created_at timestamptz not null default now(),
  constraint club_required_for_club_role
    check (role = 'admin' or club_id is not null)
);

create index if not exists club_members_club_idx on public.club_members (club_id);

-- --------------------------------------------------------------- events ----
create table if not exists public.events (
  id                     uuid primary key default gen_random_uuid(),
  event_code             text not null unique
                         check (event_code ~ '^VT26_[A-Z]{3,10}_[0-9]{3}-E[0-9]{2}$'),
  club_id                text not null references public.clubs(id) on delete cascade,
  school                 text not null references public.schools(code) on update cascade,
  slug                   text not null unique,

  title                  text not null check (char_length(title) between 3 and 80),
  tagline                text check (char_length(tagline) <= 120),
  description            text not null check (char_length(description) between 40 and 4000),
  rules                  text check (char_length(rules) <= 4000),
  category               text not null,
  mode                   event_mode not null default 'offline',

  start_at               timestamptz not null,
  end_at                 timestamptz not null,
  venue                  text not null,

  team_type              team_type not null default 'solo',
  team_min               int not null default 1 check (team_min >= 1),
  team_max               int not null default 1 check (team_max >= 1),
  max_participants       int check (max_participants > 0),
  registration_fee       numeric(8,2) not null default 0 check (registration_fee >= 0),
  registration_url       text,
  registration_deadline  timestamptz,

  prize_pool             numeric(10,2) check (prize_pool >= 0),
  prizes                 text,

  coordinator_name       text not null,
  coordinator_phone      text not null check (coordinator_phone ~ '^[0-9+ ()-]{8,20}$'),
  coordinator_email      text not null check (coordinator_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

  -- poster is 1080x1350 (4:5); thumbnail is 540x675 webp, generated on upload
  poster_url             text,
  thumbnail_url          text,

  status                 event_status not null default 'draft',
  rejection_reason       text,
  is_featured            boolean not null default false,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  submitted_at           timestamptz,
  reviewed_at            timestamptz,
  reviewed_by            uuid references auth.users(id),

  constraint end_after_start check (end_at > start_at),
  constraint team_range      check (team_max >= team_min),
  -- an event can only leave draft once it has a poster
  constraint poster_required_when_submitted
    check (status = 'draft' or poster_url is not null)
);

create index if not exists events_status_idx    on public.events (status);
create index if not exists events_club_idx      on public.events (club_id);
create index if not exists events_school_idx    on public.events (school);
create index if not exists events_category_idx  on public.events (category);
create index if not exists events_start_idx     on public.events (start_at);

-- ------------------------------------------------------------ functions ----

-- Allocate the next club ID for a school, atomically.
-- Usage:  select public.issue_club_id('SCOPE', 'Google Developer Group', 'Ravi K', 'ravi@vitap.ac.in');
create or replace function public.issue_club_id(
  p_school        text,
  p_name          text,
  p_contact_name  text,
  p_contact_email text,
  p_tagline       text default null,
  p_contact_phone text default null,
  p_instagram     text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_index int;
  v_id    text;
begin
  p_school := upper(p_school);

  if not exists (select 1 from public.schools where code = p_school) then
    raise exception 'Unknown school code: %', p_school;
  end if;

  -- lock the school row so two admins cannot grab the same index
  perform 1 from public.schools where code = p_school for update;

  select coalesce(max(club_index), 0) + 1 into v_index
  from public.clubs where school = p_school;

  if v_index > 999 then
    raise exception 'School % has reached the 999-club limit', p_school;
  end if;

  v_id := 'VT26_' || p_school || '_' || lpad(v_index::text, 3, '0');

  insert into public.clubs (id, school, club_index, name, tagline,
                            contact_name, contact_email, contact_phone, instagram)
  values (v_id, p_school, v_index, p_name, p_tagline,
          p_contact_name, p_contact_email, p_contact_phone, p_instagram);

  return v_id;
end;
$$;

-- Allocate the next event code for a club: VT26_SCOPE_001-E01, -E02, ...
create or replace function public.next_event_code(p_club_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  perform 1 from public.clubs where id = p_club_id for update;

  select coalesce(max(substring(event_code from '-E([0-9]{2})$')::int), 0) + 1
    into v_n
  from public.events where club_id = p_club_id;

  if v_n > 99 then
    raise exception 'Club % has reached the 99-event limit', p_club_id;
  end if;

  return p_club_id || '-E' || lpad(v_n::text, 2, '0');
end;
$$;

-- Helpers used by RLS policies.
create or replace function public.current_club_id()
returns text language sql stable security definer set search_path = public as $$
  select club_id from public.club_members where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.club_members where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Keep updated_at fresh; stamp submitted_at / reviewed_at on transitions.
create or replace function public.events_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();

  if new.status is distinct from old.status then
    if new.status = 'submitted' then
      new.submitted_at := now();
      new.rejection_reason := null;
    elsif new.status in ('approved','rejected') then
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists events_touch_trg on public.events;
create trigger events_touch_trg
  before update on public.events
  for each row execute function public.events_touch();

-- Auto-fill school + event_code on insert so clients cannot spoof them.
create or replace function public.events_defaults()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select school into new.school from public.clubs where id = new.club_id;
  if new.school is null then
    raise exception 'Unknown club_id: %', new.club_id;
  end if;

  if new.event_code is null or new.event_code = '' then
    new.event_code := public.next_event_code(new.club_id);
  end if;

  if new.slug is null or new.slug = '' then
    new.slug := lower(regexp_replace(new.title, '[^a-zA-Z0-9]+', '-', 'g'))
                || '-' || lower(right(new.event_code, 3));
  end if;

  return new;
end;
$$;

drop trigger if exists events_defaults_trg on public.events;
create trigger events_defaults_trg
  before insert on public.events
  for each row execute function public.events_defaults();

-- ------------------------------------------------------------------ RLS ----
alter table public.schools      enable row level security;
alter table public.clubs        enable row level security;
alter table public.club_members enable row level security;
alter table public.events       enable row level security;

-- schools: readable by everyone
drop policy if exists schools_read on public.schools;
create policy schools_read on public.schools for select using (true);

-- clubs: active clubs are public; admins manage
drop policy if exists clubs_read on public.clubs;
create policy clubs_read on public.clubs for select using (is_active or public.is_admin());

drop policy if exists clubs_admin_write on public.clubs;
create policy clubs_admin_write on public.clubs for all
  using (public.is_admin()) with check (public.is_admin());

-- club_members: you can read your own row; admins read all
drop policy if exists members_self_read on public.club_members;
create policy members_self_read on public.club_members for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists members_admin_write on public.club_members;
create policy members_admin_write on public.club_members for all
  using (public.is_admin()) with check (public.is_admin());

-- events: public sees approved only
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select
  using (status = 'approved');

drop policy if exists events_club_read on public.events;
create policy events_club_read on public.events for select
  using (club_id = public.current_club_id() or public.is_admin());

drop policy if exists events_club_insert on public.events;
create policy events_club_insert on public.events for insert
  with check (club_id = public.current_club_id() and status in ('draft','submitted'));

-- A club may edit its own event while it is draft/submitted/rejected.
-- Approved events are locked, the club must ask an admin to unlock.
drop policy if exists events_club_update on public.events;
create policy events_club_update on public.events for update
  using (club_id = public.current_club_id() and status <> 'approved')
  with check (club_id = public.current_club_id() and status in ('draft','submitted'));

drop policy if exists events_club_delete on public.events;
create policy events_club_delete on public.events for delete
  using (club_id = public.current_club_id() and status = 'draft');

drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events for all
  using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------- storage ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Posters are stored at:  <CLUB_ID>/<EVENT_CODE>/poster.jpg  and  .../thumb.webp
-- so the first path segment scopes writes to the owning club.
drop policy if exists posters_public_read on storage.objects;
create policy posters_public_read on storage.objects for select
  using (bucket_id = 'posters');

drop policy if exists posters_club_write on storage.objects;
create policy posters_club_write on storage.objects for insert
  with check (
    bucket_id = 'posters'
    and (storage.foldername(name))[1] = public.current_club_id()
  );

drop policy if exists posters_club_update on storage.objects;
create policy posters_club_update on storage.objects for update
  using (
    bucket_id = 'posters'
    and (storage.foldername(name))[1] = public.current_club_id()
  );

drop policy if exists posters_club_delete on storage.objects;
create policy posters_club_delete on storage.objects for delete
  using (
    bucket_id = 'posters'
    and ((storage.foldername(name))[1] = public.current_club_id() or public.is_admin())
  );

-- ----------------------------------------------------------------- view ----
create or replace view public.events_public as
  select e.*, c.name as club_name, c.logo_url as club_logo, c.instagram as club_instagram
  from public.events e
  join public.clubs c on c.id = e.club_id
  where e.status = 'approved';
