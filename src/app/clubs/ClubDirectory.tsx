'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { schoolAccent } from '@/lib/schools';
import type { Club } from '@/lib/types';

/** Initials fallback when a club hasn't uploaded a logo yet. */
function initials(name: string): string {
  return name
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ClubDirectory({ clubs }: { clubs: Club[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clubs;
    return clubs.filter((c) =>
      `${c.name} ${c.tagline ?? ''} ${c.id}`.toLowerCase().includes(needle)
    );
  }, [clubs, q]);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clubs…"
            aria-label="Search clubs"
            className="field pl-10"
          />
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            ⌕
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {filtered.length} of {clubs.length} club{clubs.length === 1 ? '' : 's'}
        </span>
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="text-xs font-medium text-brand-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="panel mt-8 p-16 text-center">
          <p className="font-display text-lg font-light text-white">No clubs match “{q}”</p>
          <p className="mt-2 text-sm text-slate-400">Try a shorter search term.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club) => {
            const accent = schoolAccent(club.school);
            return (
              <Link
                key={club.id}
                href={`/events?school=${club.school}`}
                className="group panel flex items-center gap-4 p-5 transition hover:border-white/25"
              >
                <div
                  className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden border border-white/30 bg-ink-800"
                  style={{ boxShadow: `0 0 0 1px ${accent}22` }}
                >
                  {club.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={club.logo_url}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="font-mono text-sm tracking-label"
                      style={{ color: accent }}
                    >
                      {initials(club.name)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-bold text-white">
                    {club.name}
                  </h2>
                  {club.tagline && (
                    <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-slate-400">
                      {club.tagline}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
