'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { issueClub, type IssueResult } from './actions';
import { SCHOOLS } from '@/lib/schools';
import { FEST_PREFIX } from '@/lib/clubId';

export default function IssueClubForm({ nextIndexBySchool }: { nextIndexBySchool: Record<string, number> }) {
  const router = useRouter();
  const [school, setSchool] = useState('SCOPE');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<IssueResult | null>(null);

  const preview = `${FEST_PREFIX}_${school}_${String(nextIndexBySchool[school] ?? 1).padStart(3, '0')}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const form = new FormData(e.currentTarget);
    const res = await issueClub(form);
    setResult(res);
    setBusy(false);
    if (res.ok) {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel p-6">
      <h2 className="font-display text-lg font-light text-white">Issue a club ID</h2>
      <p className="mt-1 text-xs text-slate-500">
        Allocates the next index for the school, creates the login, and links them. The password is
        shown once, so copy it before you leave this page.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="school">School *</label>
          <select
            id="school"
            name="school"
            className="field"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          >
            {SCHOOLS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}: {s.short}
              </option>
            ))}
          </select>
          <p className="hint">
            Next ID will be <span className="font-mono text-brand-400">{preview}</span>
          </p>
        </div>

        <div>
          <label className="label" htmlFor="name">Club name *</label>
          <input id="name" name="name" className="field" placeholder="Google Developer Group VIT-AP" required />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="tagline">Tagline</label>
          <input id="tagline" name="tagline" className="field" placeholder="Build with Google tech" />
        </div>

        <div>
          <label className="label" htmlFor="contact_name">Lead / contact name *</label>
          <input id="contact_name" name="contact_name" className="field" required />
        </div>

        <div>
          <label className="label" htmlFor="contact_email">Login email *</label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            className="field"
            placeholder="club@vitap.ac.in"
            required
          />
          <p className="hint">This becomes the club&apos;s login. Use a club address, not a personal one.</p>
        </div>

        <div>
          <label className="label" htmlFor="contact_phone">Phone</label>
          <input id="contact_phone" name="contact_phone" className="field" placeholder="+91 90000 00000" />
        </div>

        <div>
          <label className="label" htmlFor="instagram">Instagram</label>
          <input id="instagram" name="instagram" className="field" placeholder="@clubhandle" />
        </div>
      </div>

      <button type="submit" disabled={busy} className="btn-primary mt-6">
        {busy ? 'Issuing…' : 'Issue club ID'}
      </button>

      {result && (
        <div
          className={`mt-5  border p-4 text-sm ${
            result.ok
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          <p className="font-medium">{result.message}</p>
          {result.ok && result.password && (
            <div className="mt-3 space-y-1 font-mono text-xs">
              <p>
                Club ID: <span className="text-white">{result.clubId}</span>
              </p>
              <p>
                Password: <span className="text-white">{result.password}</span>
              </p>
              <p className="font-sans text-[11px] text-emerald-300/70">
                Copy this now. It is not stored anywhere and cannot be shown again.
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
