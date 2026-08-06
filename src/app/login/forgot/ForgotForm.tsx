'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CLUB_ID_REGEX, normaliseClubId } from '@/lib/clubId';

/**
 * Request a reset link.
 *
 * Takes a club ID or an email, the same as signing in, because a club lead
 * knows their club ID and may not remember which address the account was
 * registered with.
 *
 * The confirmation is deliberately the same whether or not the account exists.
 * Telling a stranger "no account with that email" hands them a list of who is
 * registered, and this form needs no login to reach.
 */
export default function ForgotForm() {
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const looksLikeClubId = CLUB_ID_REGEX.test(normaliseClubId(identifier));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const supabase = createClient();
      let email = identifier.trim();

      if (looksLikeClubId) {
        const clubId = normaliseClubId(identifier);
        const { data } = await supabase
          .from('clubs')
          .select('contact_email')
          .eq('id', clubId)
          .eq('is_active', true)
          .maybeSingle();

        // No match: fall through and show the same confirmation as a hit, so
        // this form cannot be used to test which club IDs are live.
        if (!data?.contact_email) {
          setSent(true);
          return;
        }
        email = data.contact_email;
      }

      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/reset`,
      });

      setSent(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-8">
        <div className="border border-emerald-500/30 bg-emerald-500/[0.08] p-5">
          <p className="font-mono text-[10px] uppercase tracking-label text-emerald-400">
            Link sent
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            If that club ID or email has an account, a reset link is on its way. It lands in the
            inbox the account was registered with and is good for one hour.
          </p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Nothing after a few minutes? Check spam, then confirm the address with the core team.
          Club accounts are registered to the contact email given when the ID was issued.
        </p>

        <Link href="/login" className="btn-ghost mt-7 w-full">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label className="label" htmlFor="identifier">
          Club ID or email
        </label>
        <input
          id="identifier"
          className="field font-mono"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="VT26_SCOPE_001"
          autoComplete="username"
          required
        />
        {identifier && (
          <p className="hint">
            {looksLikeClubId
              ? '✓ Recognised as a club ID'
              : identifier.includes('@')
                ? 'Sending to this address'
                : 'Format: VT26_SCHOOL_001, or use your registered email'}
          </p>
        )}
      </div>

      {error && (
        <p className="border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Sending…' : 'Send reset link'}
      </button>

      <Link href="/login" className="block text-center text-xs text-slate-500 hover:text-white">
        Back to sign in
      </Link>
    </form>
  );
}
