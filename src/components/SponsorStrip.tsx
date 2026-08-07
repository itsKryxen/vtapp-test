'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SectionHeader from './SectionHeader';
import { TIERS, type Sponsor } from '@/lib/sponsors';

interface SponsorStripProps {
  initialSponsors?: Sponsor[];
}

const DEFAULT_DEMO_SPONSORS: Sponsor[] = [
  {
    id: 'demo-sp-1',
    name: 'Northwind Cloud',
    tier: 'title',
    logo_url: '/demo/sponsor-northwind.webp',
    website: 'https://example.com',
    blurb: 'Presenting partner for V-TAPP 2026, backing the hackathon track and providing cloud credits to every registered team.',
    sort_order: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { id: 'demo-sp-2', name: 'Aeronix Robotics', tier: 'gold', logo_url: '/demo/sponsor-aeronix.webp', website: 'https://example.com', blurb: 'Autonomous systems and hardware partner', sort_order: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-3', name: 'Quantile Analytics', tier: 'gold', logo_url: '/demo/sponsor-quantile.webp', website: 'https://example.com', blurb: 'Official AI & Data Systems Partner', sort_order: 20, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-4', name: 'Vertex Labs', tier: 'gold', logo_url: '/demo/sponsor-vertex-labs.webp', website: 'https://example.com', blurb: 'Web3 & Quantum Compute Infrastructure', sort_order: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-5', name: 'Kalpana Aerospace', tier: 'silver', logo_url: '/demo/sponsor-kalpana.webp', website: 'https://example.com', blurb: null, sort_order: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-6', name: 'Stackforge Systems', tier: 'silver', logo_url: '/demo/sponsor-stackforge.webp', website: 'https://example.com', blurb: null, sort_order: 20, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-7', name: 'Meridian Energy', tier: 'silver', logo_url: '/demo/sponsor-meridian.webp', website: 'https://example.com', blurb: null, sort_order: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-8', name: 'BlueCircuit Tech', tier: 'bronze', logo_url: '/demo/sponsor-bluecircuit.webp', website: 'https://example.com', blurb: null, sort_order: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-9', name: 'CyberPulse Security', tier: 'bronze', logo_url: null, website: 'https://example.com', blurb: null, sort_order: 20, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-10', name: 'HyperDrive Gaming', tier: 'bronze', logo_url: null, website: 'https://example.com', blurb: null, sort_order: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-11', name: 'Nexus Media', tier: 'partner', logo_url: null, website: 'https://example.com', blurb: null, sort_order: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-12', name: 'DevAlliance', tier: 'partner', logo_url: null, website: 'https://example.com', blurb: null, sort_order: 20, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'demo-sp-13', name: 'CodeSphere India', tier: 'partner', logo_url: null, website: 'https://example.com', blurb: null, sort_order: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const TIER_COLORS: Record<string, string> = {
  title: '#e0685e',
  gold: '#e3b23c',
  silver: '#c9cdd4',
  bronze: '#c08457',
  partner: '#a1a1aa',
};

function SingleSponsorCard({ sponsor, idx }: { sponsor: Sponsor; idx: number }) {
  const accentColor = TIER_COLORS[sponsor.tier] || '#e0685e';
  const logo = sponsor.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsor.logo_url}
      alt={sponsor.name}
      loading="lazy"
      decoding="async"
      className="max-h-10 max-w-[130px] object-contain opacity-75 transition duration-300 filter grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
    />
  ) : (
    <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-slate-300 transition duration-300 group-hover:text-white group-hover:scale-105">
      {sponsor.name}
    </span>
  );

  const inner = (
    <>
      {/* Dynamic scanline on hover */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
        <div className="w-full h-1 bg-brand-500 absolute top-0 left-0 animate-scan" />
      </div>

      {/* Cyberpunk corner accent mark */}
      <div
        className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-colors duration-300"
        style={{ borderColor: accentColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-colors duration-300"
        style={{ borderColor: accentColor }}
      />

      {/* Header metadata tag */}
      <div className="absolute left-2.5 top-2 flex items-center gap-1.5 pointer-events-none">
        <span
          className="font-mono text-[8px] uppercase tracking-widest px-1 py-0.5 rounded bg-black/60 border border-white/30"
          style={{ color: accentColor }}
        >
          {sponsor.tier}
        </span>
      </div>

      <span className="absolute right-2.5 top-2 font-mono text-[9px] text-slate-500 group-hover:text-white transition-colors pointer-events-none">
        #{String(idx + 1).padStart(2, '0')}
      </span>

      <div className="mt-3 flex flex-col items-center justify-center text-center">
        {logo}
      </div>
    </>
  );

  return (
    <div className={idx % 2 === 0 ? 'sponsor-card-float-1 shrink-0' : 'sponsor-card-float-2 shrink-0'}>
      {sponsor.website ? (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="sponsor-cell group relative flex h-28 w-52 shrink-0 flex-col items-center justify-center border border-white/[0.09] bg-ink-950/90 px-4 backdrop-blur-sm transition-all duration-300 hover:z-20 hover:border-brand-500/60 hover:bg-ink-900 hover:shadow-[0_0_20px_rgba(179,40,33,0.3)] hover:-translate-y-1"
        >
          {inner}
        </a>
      ) : (
        <div className="sponsor-cell group relative flex h-28 w-52 shrink-0 flex-col items-center justify-center border border-white/[0.09] bg-ink-950/90 px-4 backdrop-blur-sm transition-all duration-300 hover:z-20 hover:border-brand-500/60 hover:bg-ink-900 hover:shadow-[0_0_20px_rgba(179,40,33,0.3)] hover:-translate-y-1">
          {inner}
        </div>
      )}
    </div>
  );
}

export default function SponsorStrip({ initialSponsors }: SponsorStripProps) {
  const sponsorsList = initialSponsors && initialSponsors.length > 0 ? initialSponsors : DEFAULT_DEMO_SPONSORS;
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredSponsors = selectedTier === 'all'
    ? sponsorsList
    : sponsorsList.filter((s) => s.tier === selectedTier);

  // Split into two rows for dual-moving ticker tracks
  const row1 = filteredSponsors.filter((_, i) => i % 2 === 0);
  const row2 = filteredSponsors.filter((_, i) => i % 2 !== 0);

  // Ensure minimum items in marquee loop by duplicating if necessary
  const displayRow1 = [...row1, ...row1, ...row1, ...row1].slice(0, 16);
  const displayRow2 = [...row2, ...row2, ...row2, ...row2].slice(0, 16);

  const titleSponsor = sponsorsList.find((s) => s.tier === 'title') || sponsorsList[0];

  return (
    <section className="container-x relative mt-28 mb-16 overflow-hidden">
      {/* Background Holographic Ambient Light */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[120px]" />

      <SectionHeader
        index="03"
        slug="PARTNERS"
        title="Our Official Sponsors"
        meta={`${sponsorsList.length} BACKERS ACTIVE`}
        action={
          <Link href="/sponsors" className="btn-ghost !px-5 !py-2.5 hover:border-brand-500 hover:text-white">
            Explore All Sponsors →
          </Link>
        }
      />

      {/* Featured Title Sponsor Spotlight Card */}
      {titleSponsor && (
        <div className="relative mt-8 mb-12 overflow-hidden border border-brand-500/30 bg-gradient-to-r from-ink-950 via-brand-950/20 to-ink-950 p-6 sm:p-8 backdrop-blur-md rounded-sm">
          <div className="pointer-events-none absolute inset-0 halftone opacity-10" />
          <div className="pointer-events-none absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="flex h-20 w-44 shrink-0 items-center justify-center border border-brand-500/40 bg-black/80 px-4 shadow-[0_0_25px_rgba(224,104,94,0.25)]">
                {titleSponsor.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={titleSponsor.logo_url}
                    alt={titleSponsor.name}
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <span className="font-display text-lg text-white font-bold">{titleSponsor.name}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="inline-block h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-400 font-bold">
                    PRESENTING TITLE SPONSOR
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-white font-light mt-1">
                  {titleSponsor.name}
                </h3>
                {titleSponsor.blurb && (
                  <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {titleSponsor.blurb}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <a
                href={titleSponsor.website || 'https://example.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-3 !px-6 text-xs shadow-[0_0_15px_rgba(224,104,94,0.4)]"
              >
                Visit Partner Site ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tier Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/30 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">FILTER BY TIER:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTier('all')}
              className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1 border transition-all duration-200 ${
                selectedTier === 'all'
                  ? 'border-brand-500 bg-brand-500/20 text-white shadow-[0_0_10px_rgba(224,104,94,0.3)]'
                  : 'border-white/30 bg-black/40 text-slate-400 hover:border-white/30 hover:text-white'
              }`}
            >
              ALL ({sponsorsList.length})
            </button>
            {TIERS.map((tier) => {
              const count = sponsorsList.filter((s) => s.tier === tier.value).length;
              if (count === 0) return null;
              const isActive = selectedTier === tier.value;
              return (
                <button
                  key={tier.value}
                  onClick={() => setSelectedTier(tier.value)}
                  className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1 border transition-all duration-200 ${
                    isActive
                      ? 'border-brand-500 bg-brand-500/20 text-white shadow-[0_0_10px_rgba(224,104,94,0.3)]'
                      : 'border-white/30 bg-black/40 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                  style={isActive ? { borderColor: tier.accent } : undefined}
                >
                  {tier.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Dual Moving Marquee Container */}
      <div className="relative w-full overflow-hidden border-y border-white/30 bg-black/40 py-6 space-y-4">
        {/* Edge Soft Fade Gradient Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-ink-950 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-ink-950 to-transparent z-20" />

        {/* Track 1: Leftward Infinite Motion */}
        <div className="sponsor-marquee-track gap-5">
          {displayRow1.map((s, idx) => (
            <SingleSponsorCard key={`r1-${s.id}-${idx}`} sponsor={s} idx={idx} />
          ))}
        </div>

        {/* Track 2: Rightward Infinite Motion (Reverse) */}
        <div className="sponsor-marquee-track-reverse gap-5">
          {displayRow2.map((s, idx) => (
            <SingleSponsorCard key={`r2-${s.id}-${idx}`} sponsor={s} idx={idx} />
          ))}
        </div>
      </div>

      {/* Cyberpunk Sponsorship Call To Action Dock */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/30 bg-ink-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-brand-500/40 bg-brand-500/10 text-brand-400 font-mono text-lg font-bold">
            🤝
          </div>
          <div>
            <h4 className="font-display text-base text-white">Partner with V-TAPP 2026</h4>
            <p className="font-mono text-[11px] text-slate-400">
              Connect your brand with 5,000+ top engineering & technology students across India.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <a
            href="mailto:vtapp@vitap.ac.in?subject=V-TAPP%202026%20Sponsorship%20Inquiry"
            className="btn-ghost text-xs !py-2.5 !px-4 hover:border-brand-500 hover:text-white w-full sm:w-auto text-center"
          >
            Request Deck 📥
          </a>
          <Link
            href="/sponsors"
            className="btn-primary text-xs !py-2.5 !px-5 w-full sm:w-auto text-center"
          >
            Become a Sponsor
          </Link>
        </div>
      </div>
    </section>
  );
}
