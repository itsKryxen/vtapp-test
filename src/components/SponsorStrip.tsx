'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import SectionHeader from './SectionHeader';
import { TIERS, type Sponsor } from '@/lib/sponsors';

export default function SponsorStrip({ initialSponsors = [] }: { initialSponsors?: Sponsor[] }) {
  const [selectedTier, setSelectedTier] = useState('all');
  const reduceMotion = useReducedMotion();
  if (initialSponsors.length === 0) return null;

  const titleSponsor = initialSponsors.find((sponsor) => sponsor.tier === 'title') ?? initialSponsors[0];
  const filtered = selectedTier === 'all'
    ? initialSponsors
    : initialSponsors.filter((sponsor) => sponsor.tier === selectedTier);

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 430, damping: 38, mass: 0.75 };

  return (
    <section className="container-x my-20 sm:my-28">
      <SectionHeader
        index="06"
        slug="PARTNERS"
        title="Backed by builders"
        description="Partners supporting the teams, stages, and technical tracks behind V-TAPP 2026."
        meta={`${initialSponsors.length} PARTNERS`}
        action={<Link href="/sponsors" className="btn-ghost">All sponsors</Link>}
      />

      <div className="grid min-w-0 gap-px border border-white/15 bg-white/15 lg:grid-cols-[1.1fr_.9fr]">
        <div className="min-w-0 bg-ink-900 p-6 sm:p-8">
          <p className="mono-label text-brand-400">Presenting partner</p>
          <div className="mt-7 flex min-h-24 items-center justify-center border border-white/15 bg-ink-950 p-6">
            {titleSponsor.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={titleSponsor.logo_url} alt={titleSponsor.name} className="max-h-16 max-w-[240px] object-contain" />
            ) : (
              <strong className="font-display text-2xl text-white">{titleSponsor.name}</strong>
            )}
          </div>
          {titleSponsor.blurb && <p className="mt-5 text-sm leading-6 text-slate-400">{titleSponsor.blurb}</p>}
          {titleSponsor.website && (
            <a href={titleSponsor.website} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-label text-brand-400 transition-colors duration-150 hover:text-brand-300">
              Visit partner <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        <div className="min-w-0 bg-ink-950 p-6 sm:p-8">
          <div className="filter-chip-row flex gap-2 overflow-x-auto pb-3" role="group" aria-label="Filter sponsors by tier">
            <button onClick={() => setSelectedTier('all')} aria-pressed={selectedTier === 'all'} className={`sponsor-filter ${selectedTier === 'all' ? 'is-active' : ''}`}>All</button>
            {TIERS.map((tier) => {
              const count = initialSponsors.filter((sponsor) => sponsor.tier === tier.value).length;
              if (!count) return null;
              return (
                <button key={tier.value} onClick={() => setSelectedTier(tier.value)} aria-pressed={selectedTier === tier.value} className={`sponsor-filter ${selectedTier === tier.value ? 'is-active' : ''}`}>
                  {tier.label}
                </button>
              );
            })}
          </div>

          <motion.div layout className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3" transition={spring}>
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((sponsor) => (
                <motion.div
                  layout
                  key={sponsor.id}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
                  transition={spring}
                >
                  <SponsorTile sponsor={sponsor} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  const content = (
    <>
      <span className="mono-label absolute left-3 top-3 text-[8px]">{sponsor.tier}</span>
      {sponsor.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sponsor.logo_url} alt={sponsor.name} loading="lazy" decoding="async" className="max-h-9 max-w-[110px] object-contain opacity-75 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0" />
      ) : (
        <span className="max-w-[9rem] text-center text-xs font-semibold text-slate-300">{sponsor.name}</span>
      )}
    </>
  );

  const classes = 'group relative flex min-h-24 items-center justify-center border border-white/10 bg-ink-900 px-3 pt-6 transition-[border-color,background-color,transform] duration-[180ms] hover:-translate-y-px hover:border-white/25 hover:bg-ink-800';
  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer sponsored" className={classes}>{content}</a>
  ) : (
    <div className={classes}>{content}</div>
  );
}
