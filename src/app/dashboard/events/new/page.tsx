import Link from 'next/link';
import { redirect } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { getMembership } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  const membership = await getMembership();
  if (!membership) redirect('/login');

  if (!membership.club_id) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-xl font-bold">Admin accounts cannot host events</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in with a club account to submit an event.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
          ← My events
        </Link>
        <h1 className="mt-2 display-md">New event</h1>
        <p className="mt-1 text-sm text-slate-400">
          Submitting as{' '}
          <span className="font-mono text-brand-400">{membership.club_id}</span>
          {membership.club?.name ? ` · ${membership.club.name}` : ''}. Your event code is assigned
          automatically on save.
        </p>
      </div>

      <EventForm clubId={membership.club_id} />
    </>
  );
}
