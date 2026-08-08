import { PageHeader } from '@/components/SectionHeader';
import type { Metadata } from 'next';
import EventCircuitField from '@/components/EventCircuitField';
import EventCard from '@/components/EventCard';
import { getApprovedEvents } from '@/lib/data';
import EventsComingSoonSection from '@/components/EventsComingSoonSection';
import EventFilters from '@/components/EventFilters';

export const metadata: Metadata = {
  title: 'All events',
  description: 'Every event at V-TAPP 2026, across all student clubs of VIT-AP University.',
};

export const revalidate = 3600;

interface Props {
  searchParams: { school?: string; category?: string; q?: string };
}

export default async function EventsPage({ searchParams }: Props) {
  const isFiltered = Boolean(searchParams.school || searchParams.category || searchParams.q);

  const events = await getApprovedEvents({
    school: searchParams.school,
    category: searchParams.category,
    q: searchParams.q,
  });

  return (
    <div className="container-x pb-20 pt-24 sm:pb-24 sm:pt-28">
      <div className="mb-10">
        <PageHeader
          index="03"
          slug="EVENTS"
          title={<>All events</>}
          description="Search the full V-TAPP programme, filter by discipline, and compare the details that matter before registering."
          meta={`${events.length} INDEXED`}
        />
      </div>

      <div className="sticky top-[72px] z-30 -mx-5 mb-10 border-y border-white/15 bg-ink-950/95 px-5 py-4 backdrop-blur-xl sm:top-20 sm:mx-0 sm:border sm:px-4">
        <EventFilters total={events.length} />
      </div>

      {events.length === 0 ? (
        isFiltered ? (
          <div className="panel p-16 text-center">
            <p className="font-display text-xl font-light text-white">
              Nothing matches those filters
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Try clearing a filter, or check back later. Clubs are still publishing.
            </p>
          </div>
        ) : (
          <EventsComingSoonSection />
        )
      ) : (
        <EventCircuitField>
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((e, i) => (
              <EventCard
                key={e.id}
                event={e}
                clubName={e.club?.name}
                priority={i < 4}
                index={i}
              />
            ))}
          </div>
        </EventCircuitField>
      )}
    </div>
  );
}
