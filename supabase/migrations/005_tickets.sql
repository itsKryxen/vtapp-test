-- ============================================================================
-- V-TAPP 2026, migration 005: ticketing.
-- Run in the Supabase SQL editor after the main schema. Safe to re-run.
--
-- Two products:
--   combo  a single pass covering every event, flat rate
--   event  one ticket per selected event, priced from events.registration_fee
--
-- Payment happens on the university portal at events.vitap.ac.in. We create a
-- pending order here, hand the reference over, and the portal redirects back
-- with a status. Because that confirmation arrives as a URL parameter it is
-- not cryptographically trustworthy, so a completed order is marked
-- status='paid' but verified=false. Treat verified=false as "claimed, not yet
-- reconciled" and confirm against the portal's own records before granting
-- entry. The admin panel can flip verified once reconciled.
-- ============================================================================

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
