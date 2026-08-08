import { PageHeader } from '@/components/SectionHeader';
import type { Metadata } from 'next';
import EventCircuitField from '@/components/EventCircuitField';
import EventCard from '@/components/EventCard';
import { getApprovedEvents } from '@/lib/data';
import EventsComingSoonSection from '@/components/EventsComingSoonSection';

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
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <div className="mb-10">
        <PageHeader
          index="03"
          slug="EVENTS"
          title={<>All events</>}
        />
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
          <div className="grid items-stretch gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
