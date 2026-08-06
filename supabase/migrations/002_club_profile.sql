-- ============================================================================
-- V-TAPP 2026, migration 002: let a club edit its own profile (logo, tagline,
-- contact details) from the dashboard.
--
-- Run this in the Supabase SQL editor AFTER schema.sql. Safe to re-run.
--
-- Why an RPC instead of an RLS update policy: Postgres RLS is row-level, not
-- column-level, so a plain "clubs can update their own row" policy would also
-- let a club rename itself, flip is_active, or change the login email. This
-- function is the allow-list: it only ever touches the five safe columns.
-- ============================================================================

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

  -- Pass '' to deliberately clear a field; pass null to leave it untouched.
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

-- Clubs already have insert/update/delete on their own storage folder
-- (posters/<CLUB_ID>/...) from schema.sql, so <CLUB_ID>/logo.webp needs no
-- extra policy.
