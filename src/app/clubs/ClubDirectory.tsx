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
      `${c.name} ${c.tagline ?? ''} ${c.id} ${c.school}`.toLowerCase().includes(needle)
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
        <span className="text-xs text-slate-500 font-mono">
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
        <div className="event-frame mt-8 p-16 text-center">
          <p className="font-display text-lg font-light text-white">No clubs match “{q}”</p>
          <p className="mt-2 text-sm text-slate-400">Try a shorter search term.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club, index) => {
            const accent = schoolAccent(club.school);
            const displayIndex = String(index + 1).padStart(2, '0');
            return (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="event-frame group flex min-h-[168px] flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg"
              >
                <div className="event-card-header">
                  <span className="event-card-index">{displayIndex}</span>
                  <div className="event-card-status">
                    <span className="event-card-status-dot" aria-hidden="true" />
                    <span className="event-card-status-label">REGISTERED CLUB</span>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-4 p-4">
                  {/* Unified Themed Club Logo Badge for all clubs */}
                  <div
                    className="relative grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-xl border-2 bg-gradient-to-br from-ink-950 via-ink-900 to-black p-1 shadow-lg transition-transform duration-300 group-hover:scale-105"
                    style={{
                      borderColor: `${accent}99`,
                      boxShadow: `0 0 20px ${accent}25`,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <span
                        className="font-display font-black text-base sm:text-lg tracking-wider drop-shadow-md"
                        style={{ color: accent }}
                      >
                        {initials(club.name)}
                      </span>
                      <span className="font-mono text-[8px] font-bold tracking-widest text-slate-400 uppercase opacity-80 mt-0.5">
                        VIT-AP
                      </span>
                    </div>
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="event-card-category-badge">VIT-AP</span>
                    <h2 className="event-card-title mt-1 text-base sm:text-lg font-bold line-clamp-1 group-hover:text-brand-300 transition-colors">
                      {club.name}
                    </h2>
                    {club.tagline && (
                      <p className="event-card-tagline mt-1 line-clamp-2 text-xs text-slate-400">
                        {club.tagline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="event-frame-action group-hover:bg-white/5 transition-colors flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs font-mono text-slate-300">
                  <span className="group-hover:text-white transition-colors">View events</span>
                  <span className="event-card-btn-arrow transition-transform duration-300 group-hover:translate-x-1.5 text-brand-400" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

