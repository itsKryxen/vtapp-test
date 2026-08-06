import { createClient } from '@/lib/supabase/server';
import ReviewCard from './ReviewCard';
import type { EventRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminReviewPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from('events')
    .select('*, club:clubs(id, name)')
    .in('status', ['submitted', 'approved', 'rejected'])
    .order('submitted_at', { ascending: true });

  const all = (data ?? []) as (EventRecord & { club: { id: string; name: string } | null })[];
  const queue = all.filter((e) => e.status === 'submitted');
  const decided = all.filter((e) => e.status !== 'submitted');

  return (
    <>
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="font-display display-md">Awaiting review</h2>
          <span className="chip">{queue.length}</span>
        </div>

        {queue.length === 0 ? (
          <div className="panel p-12 text-center text-sm text-slate-400">
            Queue is clear. Nothing waiting on the core team.
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((e) => (
              <ReviewCard key={e.id} event={e} clubName={e.club?.name ?? null} />
            ))}
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display display-md">Already reviewed</h2>
          <div className="space-y-3">
            {decided.map((e) => (
              <div key={e.id} className="panel flex flex-wrap items-center gap-4 p-4">
                <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-ink-800">
                  {e.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] text-slate-500">{e.event_code}</p>
                  <p className="truncate text-sm font-medium text-white">{e.title}</p>
                  <p className="text-xs text-slate-500">{e.club?.name}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                    e.status === 'approved'
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                      : 'border-rose-500/30 bg-rose-500/15 text-rose-300'
                  }`}
                >
                  {e.status === 'approved' ? 'Published' : 'Sent back'}
                </span>
                <ReviewCard event={e} clubName={e.club?.name ?? null} compact />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
