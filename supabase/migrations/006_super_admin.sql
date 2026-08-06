-- =============================================================================
-- 006  SUPER ADMIN
--
-- Splits the core team in two.
--
--   admin        role = 'admin', club_id set. A club lead trusted to review and
--                approve events across the fest, but still tied to their club.
--   super admin  role = 'admin', club_id IS NULL. Runs the fest itself. Can do
--                everything an admin can, plus issue club IDs and create the
--                logins that go with them.
--
-- Nothing new is stored: the shape already existed. `club_required_for_club_role`
-- on club_members means only an admin row is allowed a null club, so a null club
-- is not an incomplete record, it is the marker for somebody with no club of
-- their own. This migration gives that condition a name and puts the accounts
-- that mint credentials behind it.
--
-- Safe to run more than once.
-- =============================================================================

-- Is the signed in user core team with no club of their own.
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.club_members
    where user_id = auth.uid()
      and role = 'admin'
      and club_id is null
  );
$$;

comment on function public.is_super_admin() is
  'Core team account not attached to any club. Can issue club IDs and create logins.';


-- ---- club rows --------------------------------------------------------------
-- Reading is unchanged. Creating, renaming and deactivating a club is now super
-- admin only, because a club row is what a login gets attached to.
drop policy if exists clubs_admin_write on public.clubs;

create policy clubs_read_admin on public.clubs for select
  using (is_active or public.is_admin());

drop policy if exists clubs_super_admin_write on public.clubs;
create policy clubs_super_admin_write on public.clubs for insert
  with check (public.is_super_admin());

drop policy if exists clubs_super_admin_update on public.clubs;
create policy clubs_super_admin_update on public.clubs for update
  using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists clubs_super_admin_delete on public.clubs;
create policy clubs_super_admin_delete on public.clubs for delete
  using (public.is_super_admin());


-- ---- membership rows --------------------------------------------------------
-- Who is an admin, and which club somebody belongs to, is the account model
-- itself. An admin should not be able to promote themselves or anyone else.
drop policy if exists members_admin_write on public.club_members;

drop policy if exists members_super_admin_write on public.club_members;
create policy members_super_admin_write on public.club_members for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Reading is unchanged: your own row, or any row if you are core team.
drop policy if exists members_self_read on public.club_members;
create policy members_self_read on public.club_members for select
  using (user_id = auth.uid() or public.is_admin());


-- =============================================================================
-- CHECK YOURSELF BEFORE YOU RUN THIS
--
-- If no row has a null club_id, nobody is a super admin and /admin/clubs locks
-- for everyone. Run this first:
--
--   select user_id, club_id, role, full_name
--   from public.club_members
--   where role = 'admin'
--   order by club_id nulls first;
--
-- Any row with club_id null is already a super admin. To promote an existing
-- admin, detach them from their club:
--
--   update public.club_members set club_id = null
--   where user_id = 'paste-the-uuid' and role = 'admin';
--
-- Note the service role key ignores every policy above, so the admin panel's
-- server actions keep working regardless. They carry their own super admin
-- check in src/app/admin/clubs/actions.ts.
-- =============================================================================
