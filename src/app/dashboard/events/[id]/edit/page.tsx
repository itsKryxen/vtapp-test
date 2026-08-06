import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { getMembership } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import type { EventRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const membership = await getMembership();
  if (!membership) redirect('/login');

  const supabase = createClient();
  const { data } = await supabase.from('events').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();

  const event = data as EventRecord;

  if (event.status === 'approved' && membership.role !== 'admin') {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-xl font-bold">This event is published</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Published events are locked so the public listing stays stable. Email the core team at{' '}
          <a href="mailto:vtapp.convenor@vitap.ac.in" className="text-brand-400 hover:underline">
            vtapp.convenor@vitap.ac.in
          </a>{' '}
          to request a change.
        </p>
        <Link href="/dashboard" className="btn-ghost mt-6">
          Back to my events
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
          ← My events
        </Link>
        <h1 className="mt-2 display-md">Edit event</h1>
        <p className="mt-1 font-mono text-xs text-brand-400">{event.event_code}</p>
      </div>

      {event.status === 'rejected' && event.rejection_reason && (
        <div className="mb-6 border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
          <p className="font-semibold">Changes requested by the core team</p>
          <p className="mt-1">{event.rejection_reason}</p>
        </div>
      )}

      <EventForm clubId={event.club_id} event={event} />
    </>
  );
}
