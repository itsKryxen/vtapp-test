'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { SCHOOL_CODES } from '@/lib/schools';

export interface IssueResult {
  ok: boolean;
  message: string;
  clubId?: string;
  password?: string;
}

function randomPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');

  const { data } = await supabase
    .from('club_members')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (data?.role !== 'admin') throw new Error('Admin access required.');
}

/**
 * Issues the next club ID for a school, creates the login, and links the two.
 *
 *   1. issue_club_id() allocates VT26_<SCHOOL>_<NNN> atomically
 *   2. a Supabase auth user is created with the contact email + a generated password
 *   3. club_members links that user to the club
 *
 * The generated password is returned ONCE so the core team can hand it over.
 */
export async function issueClub(formData: FormData): Promise<IssueResult> {
  try {
    await assertAdmin();

    const school = String(formData.get('school') ?? '').toUpperCase();
    const name = String(formData.get('name') ?? '').trim();
    const contactName = String(formData.get('contact_name') ?? '').trim();
    const contactEmail = String(formData.get('contact_email') ?? '').trim().toLowerCase();
    const tagline = String(formData.get('tagline') ?? '').trim() || null;
    const contactPhone = String(formData.get('contact_phone') ?? '').trim() || null;
    const instagram = String(formData.get('instagram') ?? '').trim() || null;

    if (!SCHOOL_CODES.includes(school as (typeof SCHOOL_CODES)[number])) {
      return { ok: false, message: 'Pick a valid school.' };
    }
    if (name.length < 2) return { ok: false, message: 'Enter the club name.' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
      return { ok: false, message: 'Enter a valid contact email. This becomes the login.' };
    }

    const admin = createAdminClient();

    // 1. allocate the ID
    const { data: clubId, error: rpcError } = await admin.rpc('issue_club_id', {
      p_school: school,
      p_name: name,
      p_contact_name: contactName,
      p_contact_email: contactEmail,
      p_tagline: tagline,
      p_contact_phone: contactPhone,
      p_instagram: instagram,
    });

    if (rpcError || !clubId) {
      return { ok: false, message: rpcError?.message ?? 'Could not allocate a club ID.' };
    }

    // 2. create the login
    const password = randomPassword();
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email: contactEmail,
      password,
      email_confirm: true,
      user_metadata: { club_id: clubId, club_name: name },
    });

    if (authError || !created.user) {
      // Roll back the club row so the index is not burned.
      await admin.from('clubs').delete().eq('id', clubId as string);
      return {
        ok: false,
        message:
          authError?.message.includes('already been registered')
            ? `${contactEmail} already has an account. Link it manually in club_members, or use a different email.`
            : (authError?.message ?? 'Could not create the login.'),
      };
    }

    // 3. link login -> club
    const { error: linkError } = await admin.from('club_members').insert({
      user_id: created.user.id,
      club_id: clubId as string,
      role: 'club',
      full_name: contactName || name,
    });

    if (linkError) {
      return { ok: false, message: `Club created but linking failed: ${linkError.message}` };
    }

    revalidatePath('/admin/clubs');
    revalidatePath('/clubs');

    return {
      ok: true,
      message: `Issued ${clubId} to ${name}.`,
      clubId: clubId as string,
      password,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

export async function setClubActive(clubId: string, active: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from('clubs').update({ is_active: active }).eq('id', clubId);
  revalidatePath('/admin/clubs');
}

/* ------------------------------------------------------------------ */
/*  Bulk CSV import                                                    */
/* ------------------------------------------------------------------ */

export interface BulkImportRow {
  school: string;
  name: string;
  contact_name: string;
  contact_email: string;
  tagline: string | null;
  contact_phone: string | null;
  instagram: string | null;
}

export interface BulkImportResult {
  ok: boolean;
  message: string;
  name: string;
  email: string;
  clubId?: string;
  password?: string;
}

/**
 * Processes an array of club rows one-by-one.
 * Each row goes through the same issue_club_id → createUser → link pipeline
 * as the single-club form. Results (including one-time passwords) are returned
 * for every row so the admin can save them.
 */
export async function bulkImportClubs(rows: BulkImportRow[]): Promise<BulkImportResult[]> {
  await assertAdmin();

  if (rows.length === 0) return [];
  if (rows.length > 100) {
    return [{ ok: false, message: 'Maximum 100 clubs per batch.', name: '', email: '' }];
  }

  const admin = createAdminClient();
  const results: BulkImportResult[] = [];

  for (const row of rows) {
    const { school, name, contact_name, contact_email, tagline, contact_phone, instagram } = row;

    // Validate
    if (!SCHOOL_CODES.includes(school as (typeof SCHOOL_CODES)[number])) {
      results.push({ ok: false, message: `Invalid school: ${school}`, name, email: contact_email });
      continue;
    }
    if (name.length < 2) {
      results.push({ ok: false, message: 'Name too short', name, email: contact_email });
      continue;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact_email)) {
      results.push({ ok: false, message: 'Invalid email', name, email: contact_email });
      continue;
    }

    try {
      // 1. Allocate club ID
      const { data: clubId, error: rpcError } = await admin.rpc('issue_club_id', {
        p_school: school,
        p_name: name,
        p_contact_name: contact_name,
        p_contact_email: contact_email,
        p_tagline: tagline,
        p_contact_phone: contact_phone,
        p_instagram: instagram,
      });

      if (rpcError || !clubId) {
        results.push({
          ok: false,
          message: rpcError?.message ?? 'Could not allocate club ID',
          name,
          email: contact_email,
        });
        continue;
      }

      // 2. Create auth user
      const password = randomPassword();
      const { data: created, error: authError } = await admin.auth.admin.createUser({
        email: contact_email,
        password,
        email_confirm: true,
        user_metadata: { club_id: clubId, club_name: name },
      });

      if (authError || !created.user) {
        // Roll back the club row
        await admin.from('clubs').delete().eq('id', clubId as string);
        results.push({
          ok: false,
          message: authError?.message.includes('already been registered')
            ? `${contact_email} already has an account`
            : (authError?.message ?? 'Could not create login'),
          name,
          email: contact_email,
        });
        continue;
      }

      // 3. Link login → club
      const { error: linkError } = await admin.from('club_members').insert({
        user_id: created.user.id,
        club_id: clubId as string,
        role: 'club',
        full_name: contact_name || name,
      });

      if (linkError) {
        results.push({
          ok: false,
          message: `Club created but linking failed: ${linkError.message}`,
          name,
          email: contact_email,
          clubId: clubId as string,
        });
        continue;
      }

      results.push({
        ok: true,
        message: `Issued ${clubId}`,
        name,
        email: contact_email,
        clubId: clubId as string,
        password,
      });
    } catch (e) {
      results.push({
        ok: false,
        message: e instanceof Error ? e.message : 'Unknown error',
        name,
        email: contact_email,
      });
    }
  }

  revalidatePath('/admin/clubs');
  revalidatePath('/clubs');
  return results;
}
