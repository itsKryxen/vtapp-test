import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import ClubDirectory from './ClubDirectory';
import { getClubs } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Clubs',
  description: 'Every student club hosting an event at V-TAPP 2026.',
};

export const revalidate = 300;

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="05"
        slug="CLUBS"
        title={<>Clubs</>}
      />

      {clubs.length === 0 ? (
        <div className="event-frame mt-10 p-16 text-center">
          <p className="font-display text-xl font-light text-white">Clubs announced soon</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            Club registrations for this edition are still open.
          </p>
        </div>
      ) : (
        <ClubDirectory clubs={clubs} />
      )}
    </div>
  );
}
