'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { getSchool } from '@/lib/schools';
import { CATEGORIES } from '@/lib/types';

export default function EventFilters({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      startTransition(() => router.push(`/events?${next.toString()}`, { scroll: false }));
    },
    [params, router]
  );

  // School is no longer a visible filter, but the param is still honoured so
  // links in from the clubs directory keep working. It shows as a dismissible
  // pill instead of a chip row.
  const school = params.get('school');
  const category = params.get('category');
  const q = params.get('q') ?? '';
  const anyActive = Boolean(school || category || q);

  return (
    <div className={`transition-opacity ${pending ? 'opacity-50' : ''}`}>
      {/* search row */}
      <form
        className="flex flex-wrap items-stretch gap-px border border-white/20 bg-white/[0.08]"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          set('q', String(form.get('q') ?? '') || null);
        }}
      >
        <div className="flex flex-1 items-center gap-3 bg-ink-950 px-4">
          <span className="mono-label text-[var(--brand)]">SEARCH</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="query…"
            aria-label="Search events"
            className="w-full min-w-0 bg-transparent py-3.5 font-mono text-sm text-white placeholder:text-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 bg-ink-950 px-3 py-2.5 sm:px-4 sm:py-3.5">
          <button type="submit" className="font-mono text-[10px] uppercase tracking-label text-brand-400 transition hover:text-brand-300">
            Search
          </button>
          <span className="font-mono text-[11px] tracking-label text-slate-400">
            {String(total).padStart(2, '0')} RESULT{total === 1 ? '' : 'S'}
          </span>
          {anyActive && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push('/events', { scroll: false }))}
              className="font-mono text-[10px] uppercase tracking-label text-[var(--brand-bright)] hover:text-[var(--brand-light)]"
            >
              RESET
            </button>
          )}
        </div>
      </form>

      {/* active school pill, only when arriving from a club link */}
      {school && (
        <button
          type="button"
          onClick={() => set('school', null)}
          className="mt-3 inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-label transition hover:border-white/40"
          style={{ borderColor: getSchool(school)?.accent ? `${getSchool(school)?.accent}66` : 'rgb(var(--brand-rgb) / 0.4)' }}
          aria-label={`Remove ${school} filter`}
        >
          <span style={{ color: getSchool(school)?.accent ?? 'var(--brand)' }}>SCHOOL: {school}</span>
          <span className="text-slate-500">✕</span>
        </button>
      )}

      {/* category row */}
      <div className="filter-chip-row mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="mono-label mr-2 shrink-0">CATEGORY</span>

        <Chip active={!category} onClick={() => set('category', null)}>
          ALL
        </Chip>

        {CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            active={category === c.value}
            onClick={() => set('category', category === c.value ? null : c.value)}
          >
            {c.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-label transition ${
        active
          ? 'border-[var(--brand)] bg-[var(--brand)] on-brand'
          : 'border-white/30 text-slate-500 hover:border-white/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
