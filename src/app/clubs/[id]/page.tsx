import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClubs } from '@/lib/data';
import ClubComingSoonPage from '@/components/ClubComingSoonPage';

export const revalidate = 3600;

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  const clubs = await getClubs();
  return clubs.map((club) => ({
    id: club.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const clubs = await getClubs();
  const club = clubs.find((c) => c.id.toLowerCase() === decodeURIComponent(params.id).toLowerCase());

  if (!club) {
    return {
      title: 'Club Not Found',
    };
  }

  return {
    title: `${club.name} — Events`,
    description: `Events for ${club.name} at V-TAPP 2026.`,
  };
}

export default async function ClubEventsPage({ params }: Props) {
  const clubs = await getClubs();
  const club = clubs.find((c) => c.id.toLowerCase() === decodeURIComponent(params.id).toLowerCase());

  if (!club) {
    notFound();
  }

  return <ClubComingSoonPage club={club} />;
}
