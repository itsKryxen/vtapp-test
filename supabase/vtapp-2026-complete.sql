-- =============================================================================
-- V-TAPP 2026, complete database setup
-- VIT-AP University International Techfest, 11 and 12 September 2026
--
-- This one file replaces schema.sql + seed.sql + migrations 002 through 005.
-- Everything that came before is folded in here, in dependency order.
--
-- HOW TO RUN
--   1. Supabase dashboard, SQL Editor, New query
--   2. Paste this whole file
--   3. Run
--
-- It is idempotent. Running it twice does nothing harmful, so it is safe to
-- re-run after editing, and safe to run on a project that already has some of
-- these objects from the older migration files.
--
-- WHAT IT CREATES
--   Tables    schools, clubs, club_members, events, sponsors, team_members,
--             ticket_orders
--   Functions issue_club_id, next_event_code, update_club_profile,
--             current_club_id, is_admin, create_ticket_order, get_ticket_order,
--             complete_ticket_order, plus timestamp triggers
--   Security  row level security on every table, storage policies for posters
--   Storage   a public "posters" bucket, 5 MB cap, images only
--   Data      the seven VIT-AP schools plus a CENTRAL bucket
--
-- AFTER RUNNING, see section 10 at the bottom to create your first admin login.
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONS AND ENUMS
-- =============================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type event_status as enum ('draft','submitted','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_mode as enum ('offline','online','hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type team_type as enum ('solo','team','both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role as enum ('club','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sponsor_tier as enum ('title','gold','silver','bronze','partner');
exception when duplicate_object then null; end $$;


-- =============================================================================
-- 2. SCHOOLS
-- The code is the middle segment of every club ID: VT26_<code>_<index>
-- =============================================================================

create table if not exists public.schools (
  code        text primary key check (code ~ '^[A-Z]{3,10}$'),
  name        text not null,
  short_name  text not null,
  accent      text not null default '#b32821',
  sort_order  int  not null default 100
);


-- =============================================================================
-- 3. CLUBS AND MEMBERS
--
-- Club ID format: VT26_SCOPE_001
--   VT26   fest prefix, VT plus the last two digits of the fest year
--   SCOPE  school code
--   001    three digits, zero padded, unique WITHIN that school, starts at 001
--
-- The index is per school, so VT26_SCOPE_001 and VT26_SENSE_001 both exist.
-- A club ID is permanent. It is the login identifier, the foreign key on every
-- event, and the first folder in that club's poster storage path.
-- =============================================================================

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
  -- the ID must always agree with its own parts
  constraint club_id_matches_parts
    check (id = 'VT26_' || school || '_' || lpad(club_index::text, 3, '0'))
);

create index if not exists clubs_school_idx on public.clubs (school);

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


-- =============================================================================
-- 4. EVENTS
--
-- Event codes derive from the club ID: VT26_SCOPE_001-E01, -E02 and so on.
-- Posters are 1080 x 1350 (4:5 portrait), thumbnails 540 x 675 WebP.
-- V-TAPP 2026 is entirely on campus, so mode is always written as 'offline'.
-- The column and enum stay in case a future edition adds an online track.
-- =============================================================================

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
  -- an event cannot leave draft without a poster
  constraint poster_required_when_submitted
    check (status = 'draft' or poster_url is not null)
);

create index if not exists events_status_idx    on public.events (status);
create index if not exists events_club_idx      on public.events (club_id);
create index if not exists events_school_idx    on public.events (school);
create index if not exists events_category_idx  on public.events (category);
create index if not exists events_start_idx     on public.events (start_at);


-- =============================================================================
-- 5. SPONSORS AND TEAM
-- =============================================================================

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


-- =============================================================================
-- 6. FUNCTIONS
-- Defined before the policies, because the policies call is_admin and
-- current_club_id.
-- =============================================================================

-- Which club the signed in user belongs to, or null.
create or replace function public.current_club_id()
returns text language sql stable security definer set search_path = public as $$
  select club_id from public.club_members where user_id = auth.uid();
$$;

-- Is the signed in user on the core team.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.club_members where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Allocate the next club ID for a school, atomically.
--   select public.issue_club_id('SCOPE', 'GDG VIT-AP', 'Aditya Rao', 'gdg@vitap.ac.in');
-- The row lock stops two admins grabbing the same index at the same moment.
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

  perform 1 from public.schools where code = p_school for update;

  select coalesce(max(club_index), 0) + 1 into v_index
  from public.clubs where school = p_school;

  if v_index > 999 then
    raise exception 'School % has reached the 999 club limit', p_school;
  end if;

  v_id := 'VT26_' || p_school || '_' || lpad(v_index::text, 3, '0');

  insert into public.clubs (id, school, club_index, name, tagline,
                            contact_name, contact_email, contact_phone, instagram)
  values (v_id, p_school, v_index, p_name, p_tagline,
          p_contact_name, p_contact_email, p_contact_phone, p_instagram);

  return v_id;
end;
$$;

-- Next event code for a club: VT26_SCOPE_001-E01, -E02 and so on.
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
    raise exception 'Club % has reached the 99 event limit', p_club_id;
  end if;

  return p_club_id || '-E' || lpad(v_n::text, 2, '0');
end;
$$;

-- Let a club edit its own profile from the dashboard.
--
-- This is a function rather than an RLS update policy on purpose. Row level
-- security is row level, not column level, so a "clubs can update their own
-- row" policy would also let a club rename itself, flip is_active, or change
-- its login email. This function is the allow list: it only ever touches the
-- five safe columns.
--
-- Pass '' to clear a field. Pass null to leave it untouched.
create or replace function public.update_club_profile(
  p_tagline       text default null,
  p_logo_url      text default null,
  p_contact_name  text default null,
  p_contact_phone text default null,
  p_instagram     text default null
) returns public.clubs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club text;
  v_row  public.clubs;
begin
  v_club := public.current_club_id();

  if v_club is null then
    raise exception 'Only a club account can edit a club profile.';
  end if;

  update public.clubs set
    tagline       = case when p_tagline       is null then tagline
                         when p_tagline       = ''   then null
                         else p_tagline       end,
    logo_url      = case when p_logo_url      is null then logo_url
                         when p_logo_url      = ''   then null
                         else p_logo_url      end,
    contact_name  = coalesce(nullif(p_contact_name, ''), contact_name),
    contact_phone = case when p_contact_phone is null then contact_phone
                         when p_contact_phone = ''   then null
                         else p_contact_phone end,
    instagram     = case when p_instagram     is null then instagram
                         when p_instagram     = ''   then null
                         else p_instagram     end
  where id = v_club
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.update_club_profile(text, text, text, text, text) from public;
grant execute on function public.update_club_profile(text, text, text, text, text) to authenticated;


-- =============================================================================
-- 7. TRIGGERS
-- =============================================================================

-- Keep updated_at fresh and stamp submitted_at / reviewed_at on transitions.
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

-- Fill in school, event_code and slug on insert, so a client cannot spoof them.
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


-- =============================================================================
-- 8. ROW LEVEL SECURITY
--
-- The shape of it:
--   public visitors  read approved events, active clubs, active sponsors,
--                    active team members, and the school list
--   club accounts    read and write their own events while draft or submitted,
--                    and write files only inside their own storage folder
--   admins           everything
-- =============================================================================

alter table public.schools      enable row level security;
alter table public.clubs        enable row level security;
alter table public.club_members enable row level security;
alter table public.events       enable row level security;
alter table public.sponsors     enable row level security;
alter table public.team_members enable row level security;

-- ---- schools: readable by everyone -----------------------------------------
drop policy if exists schools_read on public.schools;
create policy schools_read on public.schools for select using (true);

-- ---- clubs ------------------------------------------------------------------
drop policy if exists clubs_read on public.clubs;
create policy clubs_read on public.clubs for select using (is_active or public.is_admin());

drop policy if exists clubs_admin_write on public.clubs;
create policy clubs_admin_write on public.clubs for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- club members -----------------------------------------------------------
drop policy if exists members_self_read on public.club_members;
create policy members_self_read on public.club_members for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists members_admin_write on public.club_members;
create policy members_admin_write on public.club_members for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- events -----------------------------------------------------------------
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select
  using (status = 'approved');

drop policy if exists events_club_read on public.events;
create policy events_club_read on public.events for select
  using (club_id = public.current_club_id() or public.is_admin());

drop policy if exists events_club_insert on public.events;
create policy events_club_insert on public.events for insert
  with check (club_id = public.current_club_id() and status in ('draft','submitted'));

-- A club may edit its own event while draft, submitted or rejected.
-- Approved events are locked, so the public listing stays stable for anyone
-- who has already registered. Only an admin can reopen one.
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

-- ---- sponsors ---------------------------------------------------------------
drop policy if exists sponsors_public_read on public.sponsors;
create policy sponsors_public_read on public.sponsors for select using (is_active);

drop policy if exists sponsors_admin_all on public.sponsors;
create policy sponsors_admin_all on public.sponsors for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- team -------------------------------------------------------------------
drop policy if exists team_public_read on public.team_members;
create policy team_public_read on public.team_members for select using (is_active);

drop policy if exists team_admin_all on public.team_members;
create policy team_admin_all on public.team_members for all
  using (public.is_admin()) with check (public.is_admin());


-- =============================================================================
-- 9. STORAGE
--
-- One public bucket called "posters" holds everything:
--   <CLUB_ID>/<EVENT_CODE>/poster.jpg    event poster, 1080 x 1350
--   <CLUB_ID>/<EVENT_CODE>/thumb.webp    card thumbnail, 540 x 675
--   <CLUB_ID>/logo.webp                  club logo, 256 x 256
--   sponsors/<uuid>.webp                 sponsor logo, fitted in 600 x 300
--   team/<uuid>.webp                     team headshot, 512 x 512
--
-- Because the first path segment is the club ID, one club physically cannot
-- overwrite another club's files. Admins get their own policies because they
-- have no club ID, and they need to write into sponsors/ and team/.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

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

drop policy if exists posters_admin_insert on storage.objects;
create policy posters_admin_insert on storage.objects for insert
  with check (bucket_id = 'posters' and public.is_admin());

drop policy if exists posters_admin_update on storage.objects;
create policy posters_admin_update on storage.objects for update
  using (bucket_id = 'posters' and public.is_admin());


-- =============================================================================
-- 10. CONVENIENCE VIEW
-- =============================================================================

create or replace view public.events_public as
  select e.*, c.name as club_name, c.logo_url as club_logo, c.instagram as club_instagram
  from public.events e
  join public.clubs c on c.id = e.club_id
  where e.status = 'approved';


-- =============================================================================
-- 11. SEED DATA
-- The seven VIT-AP schools plus a CENTRAL bucket for university wide clubs.
-- Accent colours match src/lib/schools.ts, all drawn from the logo palette.
-- =============================================================================

insert into public.schools (code, name, short_name, accent, sort_order) values
  ('SCOPE',   'School of Computer Science and Engineering',       'Computer Science',  '#e0685e', 10),
  ('SENSE',   'School of Electronics Engineering',                'Electronics',       '#cf3f34', 20),
  ('SMEC',    'School of Mechanical Engineering',                 'Mechanical',        '#e8823c', 30),
  ('SAS',     'School of Advanced Sciences',                      'Advanced Sciences', '#e3b23c', 40),
  ('VSB',     'VIT-AP School of Business',                        'Business',          '#d8536b', 50),
  ('VSL',     'VIT-AP School of Law',                             'Law',               '#c9b8a8', 60),
  ('VISH',    'VIT-AP School of Social Sciences and Humanities',  'Social Sciences',   '#b5666b', 70),
  ('CENTRAL', 'Central and University wide Clubs',                'Central',           '#f1f1f1', 80)
on conflict (code) do update
  set name       = excluded.name,
      short_name = excluded.short_name,
      accent     = excluded.accent,
      sort_order = excluded.sort_order;


-- =============================================================================
-- 12. TICKETING
--
-- Two products: a flat-rate combo pass covering every event, and per-event
-- tickets priced from events.registration_fee.
--
-- Payment happens on the university portal at events.vitap.ac.in. We create a
-- pending order here, hand over the reference, and the portal redirects back
-- with a status. That confirmation arrives as a URL parameter, so it is not
-- cryptographically trustworthy: a completed order is marked status='paid' but
-- verified=false. Treat verified=false as "claimed, not yet reconciled" and
-- check against the portal's own records before granting entry.
--
-- The price is computed inside create_ticket_order from the events table and
-- the combo rate, never taken from the browser, so nobody can buy a combo pass
-- for one rupee by editing the request.
-- =============================================================================

do $$ begin
  create type order_status as enum ('pending','paid','failed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_kind as enum ('combo','event');
exception when duplicate_object then null; end $$;

create table if not exists public.ticket_orders (
  id            uuid primary key default gen_random_uuid(),
  -- human readable, printed on the receipt and handed to the portal
  reference     text not null unique check (reference ~ '^VT26-[A-Z0-9]{6}$'),
  kind          ticket_kind not null,
  -- empty for a combo pass, one row per selected event otherwise
  event_ids     uuid[] not null default '{}',
  amount        numeric(10,2) not null check (amount >= 0),
  currency      text not null default 'INR',

  buyer_name    text not null check (char_length(buyer_name) between 2 and 80),
  buyer_email   text not null check (buyer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  buyer_phone   text check (buyer_phone ~ '^[0-9+ ()-]{8,20}$'),
  buyer_reg_no  text,

  status        order_status not null default 'pending',
  gateway_ref   text,
  -- false until the core team reconciles against the portal's records
  verified      boolean not null default false,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  paid_at       timestamptz,

  constraint combo_has_no_events
    check (kind <> 'combo' or cardinality(event_ids) = 0),
  constraint event_order_has_events
    check (kind <> 'event' or cardinality(event_ids) > 0)
);

create index if not exists orders_status_idx on public.ticket_orders (status);
create index if not exists orders_email_idx  on public.ticket_orders (buyer_email);
create index if not exists orders_created_idx on public.ticket_orders (created_at desc);

create or replace function public.orders_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_touch_trg on public.ticket_orders;
create trigger orders_touch_trg
  before update on public.ticket_orders
  for each row execute function public.orders_touch();

-- ------------------------------------------------------------------ RLS ----
-- No direct access at all. Everything goes through the functions below, so a
-- visitor can never list other people's orders or set their own price.
alter table public.ticket_orders enable row level security;

drop policy if exists orders_admin_all on public.ticket_orders;
create policy orders_admin_all on public.ticket_orders for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------ functions ----

-- Short, unambiguous reference. Excludes I, O, 0 and 1 so it can be read aloud.
create or replace function public.gen_order_reference()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text;
  i int;
begin
  loop
    out := 'VT26-';
    for i in 1..6 loop
      out := out || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.ticket_orders where reference = out);
  end loop;
  return out;
end;
$$;

/**
 * Create a pending order.
 *
 * The amount is computed HERE from the combo price and the events table, never
 * taken from the browser, so a visitor cannot pay one rupee for a combo pass by
 * editing the request.
 */
create or replace function public.create_ticket_order(
  p_kind         text,
  p_event_ids    uuid[],
  p_buyer_name   text,
  p_buyer_email  text,
  p_buyer_phone  text default null,
  p_buyer_reg_no text default null,
  p_combo_price  numeric default 500
) returns public.ticket_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric(10,2);
  v_ref    text;
  v_row    public.ticket_orders;
  v_count  int;
begin
  if p_kind not in ('combo','event') then
    raise exception 'Unknown ticket kind: %', p_kind;
  end if;

  if p_kind = 'combo' then
    p_event_ids := '{}';
    -- the combo price is fixed by the caller's config, not by the browser
    v_amount := p_combo_price;
  else
    if p_event_ids is null or cardinality(p_event_ids) = 0 then
      raise exception 'Select at least one event.';
    end if;

    -- every id must be a real, approved event
    select count(*), coalesce(sum(registration_fee), 0)
      into v_count, v_amount
    from public.events
    where id = any(p_event_ids) and status = 'approved';

    if v_count <> cardinality(p_event_ids) then
      raise exception 'One or more events are not available.';
    end if;
  end if;

  v_ref := public.gen_order_reference();

  insert into public.ticket_orders
    (reference, kind, event_ids, amount, buyer_name, buyer_email, buyer_phone, buyer_reg_no)
  values
    (v_ref, p_kind::ticket_kind, p_event_ids, v_amount,
     trim(p_buyer_name), lower(trim(p_buyer_email)), p_buyer_phone, p_buyer_reg_no)
  returning * into v_row;

  return v_row;
end;
$$;

/** Look up a single order by its reference. Nothing else is exposed. */
create or replace function public.get_ticket_order(p_reference text)
returns public.ticket_orders
language sql
stable
security definer
set search_path = public
as $$
  select * from public.ticket_orders where reference = upper(trim(p_reference));
$$;

/**
 * Record the outcome the portal redirected back with.
 *
 * Only ever moves an order out of 'pending', so a reference cannot be replayed
 * to flip a settled order. verified stays false: this is a claim from a URL,
 * not a verified payment.
 */
create or replace function public.complete_ticket_order(
  p_reference   text,
  p_status      text,
  p_gateway_ref text default null
) returns public.ticket_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.ticket_orders;
begin
  if p_status not in ('paid','failed','cancelled') then
    raise exception 'Unknown status: %', p_status;
  end if;

  update public.ticket_orders set
    status      = p_status::order_status,
    gateway_ref = coalesce(p_gateway_ref, gateway_ref),
    paid_at     = case when p_status = 'paid' then now() else paid_at end
  where reference = upper(trim(p_reference))
    and status = 'pending'
  returning * into v_row;

  -- already settled, or unknown reference: hand back whatever is on record
  if v_row.id is null then
    select * into v_row from public.ticket_orders
    where reference = upper(trim(p_reference));
  end if;

  return v_row;
end;
$$;

revoke all on function public.create_ticket_order(text, uuid[], text, text, text, text, numeric) from public;
revoke all on function public.get_ticket_order(text) from public;
revoke all on function public.complete_ticket_order(text, text, text) from public;

grant execute on function public.create_ticket_order(text, uuid[], text, text, text, text, numeric) to anon, authenticated;
grant execute on function public.get_ticket_order(text) to anon, authenticated;
grant execute on function public.complete_ticket_order(text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------- admin ----
-- Reconciled orders, for the core team.
--   update public.ticket_orders set verified = true where reference = 'VT26-XXXXXX';


-- =============================================================================
-- 13. FIRST ADMIN, READ THIS
--
-- There is no public signup page. Accounts exist only because someone issues
-- them, so the first admin has to be created by hand, once.
--
--   Step 1  Supabase dashboard, Authentication, Users, Add user.
--           Enter your email and a password, tick auto confirm.
--
--   Step 2  Copy that user's UUID from the Users list.
--
--   Step 3  Run this, with your UUID pasted in:
--
--             insert into public.club_members (user_id, club_id, role, full_name)
--             values ('00000000-0000-0000-0000-000000000000', null, 'admin', 'Rahul');
--
--           club_id is null because an admin is not attached to a club.
--
--   Step 4  Sign in at /login. The admin panel is at /admin.
--
-- From then on, issue club accounts from /admin/clubs in the browser. That page
-- allocates the ID, creates the login, links them, and shows the generated
-- password once.
--
-- If you would rather create clubs from SQL, issue_club_id makes the club row
-- but not the login. You would still create the auth user in the dashboard and
-- insert the club_members row yourself:
--
--   select public.issue_club_id(
--     'SCOPE', 'Google Developer Group VIT-AP', 'Aditya Rao', 'gdg@vitap.ac.in',
--     'Build with Google tech'
--   );
--   -- returns VT26_SCOPE_001
--
--   insert into public.club_members (user_id, club_id, role, full_name)
--   values ('<that user uuid>', 'VT26_SCOPE_001', 'club', 'Aditya Rao');
--
-- To promote an existing club account to admin, update its row:
--
--   update public.club_members set role = 'admin', club_id = null
--   where user_id = '<uuid>';
-- =============================================================================


-- =============================================================================
-- 14. USEFUL QUERIES
-- =============================================================================

-- Everything waiting on the core team
--   select event_code, title, club_id, submitted_at
--   from public.events where status = 'submitted' order by submitted_at;

-- Club roster with event counts
--   select c.id, c.name, c.school, count(e.id) as events
--   from public.clubs c left join public.events e on e.club_id = c.id
--   group by c.id order by c.id;

-- Which club IDs are issued per school, and what comes next
--   select code,
--          count(c.id) as issued,
--          'VT26_' || code || '_' || lpad((coalesce(max(c.club_index), 0) + 1)::text, 3, '0') as next_id
--   from public.schools s left join public.clubs c on c.school = s.code
--   group by code order by code;

-- Wipe every event but keep clubs and schools, for a dry run reset
--   delete from public.events;
