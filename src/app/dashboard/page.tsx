import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMembership } from '@/lib/data';
import { FEST } from '@/lib/fest';
import type { EventRecord, EventStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<EventStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  submitted: { label: 'In review', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  approved: { label: 'Published', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Changes needed', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export default async function DashboardPage() {
  const membership = await getMembership();
  const supabase = createClient();

  let query = supabase.from('events').select('*').order('created_at', { ascending: false });
  if (membership?.role !== 'admin' && membership?.club_id) {
    query = query.eq('club_id', membership.club_id);
  }
  const { data } = await query;
  const events = (data ?? []) as EventRecord[];

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  const deadline = new Date(FEST.submissionDeadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);

  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-4">
        {(['draft', 'submitted', 'approved', 'rejected'] as EventStatus[]).map((s) => (
          <div key={s} className="panel px-4 py-4">
            <p className="font-display display-md text-white">{counts[s] ?? 0}</p>
            <p className="mt-0.5 text-xs text-slate-400">{STATUS_STYLE[s].label}</p>
          </div>
        ))}
      </div>

      {daysLeft > 0 && (
        <div className="panel mb-8 flex flex-wrap items-center gap-3 border-brand-400/25 px-5 py-4 text-sm">
          <span className="text-brand-400">⏳</span>
          <span className="text-slate-300">
            <strong className="text-white">{daysLeft} day{daysLeft === 1 ? '' : 's'}</strong> left to
            submit events for review. Deadline{' '}
            {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </span>
        </div>
      )}

      {events.length === 0 ? (
        <div className="panel p-16 text-center">
          <p className="font-display text-xl font-light text-white">No events yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Create your first event, upload a 1080 × 1350 poster, and submit it for review. You can
            save a draft and come back to it.
          </p>
          <Link href="/dashboard/events/new" className="btn-primary mt-6">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => {
            const style = STATUS_STYLE[e.status];
            return (
              <div key={e.id} className="panel flex flex-wrap items-center gap-4 p-4">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-ink-800">
                  {e.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-[9px] text-slate-600">
                      no poster
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-slate-500">{e.event_code}</p>
                  <p className="truncate font-medium text-white">{e.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(e.start_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {e.venue}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${style.className}`}
                >
                  {style.label}
                </span>

                <div className="flex gap-2">
                  {e.status !== 'approved' && (
                    <Link
                      href={`/dashboard/events/${e.id}/edit`}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  )}
                  {e.status === 'approved' && (
                    <Link href={`/events/${e.slug}`} className="btn-ghost !px-3 !py-1.5 text-xs">
                      View live
                    </Link>
                  )}
                </div>

                {e.status === 'rejected' && e.rejection_reason && (
                  <p className="w-full border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                    <strong>Core team:</strong> {e.rejection_reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
