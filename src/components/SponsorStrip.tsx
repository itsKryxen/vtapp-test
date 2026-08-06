import Link from 'next/link';
import SectionHeader from './SectionHeader';
import { getSponsors } from '@/lib/data';
import { TIER_ORDER, type Sponsor } from '@/lib/sponsors';

function SponsorRun({ sponsors, ariaHidden }: { sponsors: Sponsor[]; ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-4 py-4" aria-hidden={ariaHidden}>
      {sponsors.map((s, idx) => {
        const logo = s.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.logo_url}
            alt={s.name}
            loading="lazy"
            decoding="async"
            className="max-h-8 max-w-[120px] object-contain opacity-60 transition duration-300 filter grayscale group-hover:grayscale-0 group-hover:opacity-100"
          />
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-label text-slate-500 transition group-hover:text-white">
            {s.name}
          </span>
        );

        const inner = (
          <>
            {/* Halftone grid background that appears on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] halftone text-brand-500 transition-opacity duration-300 pointer-events-none" />
            
            {/* Tech laser scanline sweeping down on hover */}
            <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none">
              <div className="w-full h-1 bg-brand-500 absolute top-0 left-0 animate-scan" />
            </div>

            {/* Corner telemetry labels */}
            <span className="absolute left-2.5 top-2.5 font-mono text-[8px] uppercase tracking-label text-slate-600">
              {s.tier.slice(0, 3)}
            </span>
            <span className="absolute right-2.5 top-2.5 font-mono text-[8px] text-slate-700 group-hover:text-brand-500 transition-colors">
              [{String(idx + 1).padStart(2, '0')}]
            </span>
            {logo}
          </>
        );

        const card = s.website ? (
          <a
            key={ariaHidden ? `${s.id}-dup` : s.id}
            href={s.website}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="sponsor-cell on-media group brackets relative flex h-24 w-44 shrink-0 items-center justify-center border border-white/[0.08] bg-ink-950 px-4 transition-all duration-300 hover:z-10 hover:border-brand-500/40 hover:bg-ink-900 hover:scale-[1.06]"
          >
            {inner}
          </a>
        ) : (
          <span
            key={ariaHidden ? `${s.id}-dup` : s.id}
            className="sponsor-cell on-media group brackets relative flex h-24 w-44 shrink-0 items-center justify-center border border-white/[0.08] bg-ink-950 px-4 transition-all duration-300 hover:z-10 hover:border-brand-500/40 hover:bg-ink-900 hover:scale-[1.06]"
          >
            {inner}
          </span>
        );

        // Staggered floating wave containers
        return (
          <div key={ariaHidden ? `${s.id}-float-dup` : `${s.id}-float`} className={idx % 2 === 0 ? "sponsor-card-float-1" : "sponsor-card-float-2"}>
            {card}
          </div>
        );
      })}
    </div>
  );
}

export default async function SponsorStrip() {
  const sponsors = await getSponsors();
  if (sponsors.length === 0) return null;

  const ordered = [...sponsors]
    .sort(
      (a, b) =>
        TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.sort_order - b.sort_order
    )
    .slice(0, 12);

  return (
    <section className="container-x mt-24">
      <SectionHeader
        index="02"
        slug="BACKERS"
        title="Our sponsors"
        meta={`${ordered.length} PARTNERS`}
        action={
          <Link href="/sponsors" className="btn-ghost !px-5 !py-2.5">
            All sponsors
          </Link>
        }
      />

      <div className="relative w-full overflow-hidden border-y border-white/[0.08] bg-white/[0.005] py-2">
        {/* Edge soft fade gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-ink-950 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-ink-950 to-transparent z-20" />

        <div className="sponsor-marquee-track gap-4">
          <SponsorRun sponsors={ordered} />
          <SponsorRun sponsors={ordered} ariaHidden />
        </div>
      </div>
    </section>
  );
}
