import type { Metadata } from 'next';
import EventCircuitField from '@/components/EventCircuitField';
import { PageHeader } from '@/components/SectionHeader';
import { getSponsors } from '@/lib/data';
import { TIERS, type Sponsor } from '@/lib/sponsors';
import { FEST } from '@/lib/fest';

export const metadata: Metadata = {
  title: 'Sponsors',
  description: `The organisations backing ${FEST.name} at ${FEST.university}.`,
};

export const revalidate = 300;

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  const byTier = TIERS.map((tier) => ({
    tier,
    list: sponsors.filter((s) => s.tier === tier.value),
  })).filter((g) => g.list.length > 0);

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="06"
        slug="SPONSORS"
        title={<>Sponsors</>}
      />

      {byTier.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-14 space-y-16">
          {byTier.map(({ tier, list }) => (
            <section key={tier.value}>
              <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2
                  className="font-display display-md tracking-tight"
                  style={{ color: tier.accent }}
                >
                  {tier.label}
                </h2>
                {tier.note && <span className="text-sm text-slate-500">{tier.note}</span>}
              </div>

              <EventCircuitField>
                <div className={`grid gap-4 ${tier.grid}`}>
                  {list.map((sponsor, index) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} tier={tier} index={index} />
                  ))}
                </div>
              </EventCircuitField>
            </section>
          ))}
        </div>
      )}

      <EventCircuitField>
        <section className="event-frame mt-20 p-8 text-center sm:p-12">
          <h2 className="font-display display-md sm:text-3xl">Want to sponsor V-TAPP?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Reach thousands of engineering, business and law students across two days on campus.
            Write to us for the sponsorship deck.
          </p>
          <a href={`mailto:${FEST.email}?subject=V-TAPP%202026%20Sponsorship`} className="btn-primary mt-6">
            Request the deck
          </a>
        </section>
      </EventCircuitField>
    </div>
  );
}

function SponsorCard({
  sponsor,
  tier,
  index,
}: {
  sponsor: Sponsor;
  tier: (typeof TIERS)[number];
  index: number;
}) {
  const inner = (
    <>
      <div className="event-card-header w-full">
        <span className="event-card-index">{String(index + 1).padStart(2, '0')}</span>
        <div className="event-card-status">
          <span className="event-card-status-dot" aria-hidden="true" />
          <span className="event-card-status-label">OFFICIAL PARTNER</span>
        </div>
      </div>

      <div className={`relative z-[2] flex w-full flex-1 flex-col items-center justify-center ${tier.padding}`}>
        <span className="event-card-category-badge mb-5">{tier.label}</span>
        <div className={`flex ${tier.logoHeight} w-full items-center justify-center`}>
          {sponsor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sponsor.logo_url}
              alt={sponsor.name}
              loading="lazy"
              decoding="async"
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="text-center font-display text-lg font-light text-white">
              {sponsor.name}
            </span>
          )}
        </div>

        {sponsor.blurb && tier.value === 'title' && (
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-slate-400">
            {sponsor.blurb}
          </p>
        )}
      </div>

      {sponsor.website && (
        <div className="event-frame-action w-full">
          <span>Visit partner</span>
          <span className="event-card-btn-arrow" aria-hidden="true">↗</span>
        </div>
      )}
    </>
  );

  const className = 'sponsor-cell event-frame group flex flex-col items-center justify-center';

  if (sponsor.website) {
    return (
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={className}
        aria-label={`${sponsor.name}, opens in a new tab`}
      >
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

function EmptyState() {
  return (
    <div className="event-frame mt-14 p-16 text-center">
      <p className="font-display text-xl font-light text-white">Sponsors will be announced soon</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        We&apos;re finalising partnerships for this edition. Check back closer to{' '}
        {FEST.dateLabel}.
      </p>
    </div>
  );
}
