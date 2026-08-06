'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Phase = 'checking' | 'ready' | 'expired' | 'done';

const MIN_LENGTH = 10;

/**
 * Set a new password from a reset link.
 *
 * The link Supabase mails carries a one-time code. Depending on the project's
 * auth flow it arrives either as `?code=` on the query string, which has to be
 * exchanged for a session, or as a fragment the client library picks up on its
 * own and reports through a PASSWORD_RECOVERY event. Both are handled, because
 * which one you get depends on project settings nobody wants to think about at
 * the moment they are locked out.
 *
 * Until that exchange succeeds there is no session and no password can be set,
 * so the form stays hidden and the page says the link has expired instead of
 * failing silently on submit.
 */
export default function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // Supabase reports a dead or already-used link on the query string.
    if (params.get('error') || params.get('error_description')) {
      setPhase('expired');
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!cancelled && event === 'PASSWORD_RECOVERY') setPhase('ready');
    });

    (async () => {
      const code = params.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setPhase(exchangeError ? 'expired' : 'ready');
        return;
      }

      // No code on the query string: either the library already consumed a
      // fragment, or somebody opened this page directly.
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setPhase(data.session ? 'ready' : 'expired');
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setPhase('done');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (phase === 'checking') {
    return (
      <div className="mt-8 flex items-center gap-3">
        <span className="h-3 w-1.5 bg-brand-600 animate-blink" />
        <p className="font-mono text-[11px] uppercase tracking-label text-slate-400">
          Verifying link
        </p>
      </div>
    );
  }

  if (phase === 'expired') {
    return (
      <div className="mt-8">
        <div className="border border-rose-500/30 bg-rose-500/[0.08] p-5">
          <p className="font-mono text-[10px] uppercase tracking-label text-rose-300">
            Link no longer valid
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Reset links last an hour and work once. Ask for a fresh one and use the newest email in
            your inbox, not an older attempt.
          </p>
        </div>

        <Link href="/login/forgot" className="btn-primary mt-7 w-full">
          Send a new link
        </Link>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="mt-8">
        <div className="border border-emerald-500/30 bg-emerald-500/[0.08] p-5">
          <p className="font-mono text-[10px] uppercase tracking-label text-emerald-400">
            Password changed
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            You are signed in on this device. Any other device stays signed in on the old session
            until it expires, so sign out there if you were locked out by somebody else.
          </p>
        </div>

        <Link href="/dashboard" className="btn-primary mt-7 w-full">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label className="label" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          autoComplete="new-password"
          minLength={MIN_LENGTH}
          required
        />
        <p className="hint">At least {MIN_LENGTH} characters. A phrase beats a short scramble.</p>
      </div>

      <div>
        <label className="label" htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          className="field"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••••"
          autoComplete="new-password"
          required
        />
      </div>

      {error && (
        <p className="border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  );
}
