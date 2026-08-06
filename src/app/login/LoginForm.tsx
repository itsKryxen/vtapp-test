'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CLUB_ID_REGEX, normaliseClubId } from '@/lib/clubId';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

      // Club ID entered, resolve it to the registered login email.
      if (looksLikeClubId) {
        const clubId = normaliseClubId(identifier);
        const { data, error: lookupError } = await supabase
          .from('clubs')
          .select('contact_email')
          .eq('id', clubId)
          .eq('is_active', true)
          .maybeSingle();

        if (lookupError || !data?.contact_email) {
          setError(`No active club found with ID ${clubId}.`);
          return;
        }
        email = data.contact_email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'That club ID / email and password combination is not recognised.'
            : authError.message
        );
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
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
                ? 'Signing in with email'
                : 'Format: VT26_SCHOOL_001, or use your registered email'}
          </p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <p className="border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
