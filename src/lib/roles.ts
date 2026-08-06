/**
 * Who is allowed to do what.
 *
 * There are three kinds of account:
 *
 *   club          a club lead. Has a club_id, submits events for that club only.
 *   admin         core team attached to a club. Reviews and approves events.
 *   super admin   core team attached to no club at all, so club_id is null.
 *
 * The database already enforces the shape: `club_required_for_club_role` means
 * a row can only have a null club_id when its role is 'admin'. A null club is
 * therefore not an accident or an unfinished record, it is the marker for
 * somebody who runs the fest rather than a single club. That is the account
 * that can issue club IDs and create logins, so it is the one gate that has to
 * be tighter than plain admin.
 *
 * Read these helpers rather than testing `role` by hand, so the rule lives in
 * one place if the model grows.
 */

export interface MembershipLike {
  club_id: string | null;
  role: 'club' | 'admin';
}

/** Core team: can reach /admin and act on any club's events. */
export function isAdmin(m: MembershipLike | null | undefined): boolean {
  return m?.role === 'admin';
}

/**
 * Core team with no club of their own. Everything an admin can do, plus
 * issuing club IDs and creating the logins that go with them.
 */
export function isSuperAdmin(m: MembershipLike | null | undefined): boolean {
  return m?.role === 'admin' && m.club_id === null;
}

/** For headers and badges. */
export function roleLabel(m: MembershipLike | null | undefined): string {
  if (!m) return 'Signed out';
  if (isSuperAdmin(m)) return 'Super admin';
  if (isAdmin(m)) return 'Admin';
  return 'Club';
}

/** Mono readout used in the admin chrome, e.g. "CORE TEAM · SUPER ADMIN". */
export function roleTag(m: MembershipLike | null | undefined): string {
  if (isSuperAdmin(m)) return 'CORE TEAM · SUPER ADMIN';
  if (isAdmin(m)) return 'CORE TEAM · ADMIN';
  return 'CLUB';
}
