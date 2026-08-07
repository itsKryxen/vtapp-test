'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { schoolAccent } from '@/lib/schools';
import type { EventRecord } from '@/lib/types';

interface Props {
  event: EventRecord;
  clubName: string | null;
  compact?: boolean;
}

export default function ReviewCard({ event, clubName, compact = false }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(event.rejection_reason ?? '');
  const [error, setError] = useState<string | null>(null);

  async function decide(status: 'approved' | 'rejected' | 'submitted', rejection?: string) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: e } = await supabase
      .from('events')
      .update({ status, rejection_reason: rejection ?? null })
      .eq('id', event.id);

    if (e) setError(e.message);
    else {
      setRejecting(false);
      router.refresh();
    }
    setBusy(false);
  }

  async function toggleFeatured() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('events').update({ is_featured: !event.is_featured }).eq('id', event.id);
    router.refresh();
    setBusy(false);
  }

  if (compact) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => decide('submitted')}
        className="btn-ghost !px-3 !py-1.5 text-xs"
      >
        Reopen
      </button>
    );
  }

  const accent = schoolAccent(event.school);

  return (
    <article className="panel overflow-hidden">
      <div className="flex flex-wrap gap-5 p-5">
        <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden border border-white/30 bg-ink-800">
          {event.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.thumbnail_url ?? event.poster_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-[10px] text-rose-400">no poster</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink-950"
              style={{ backgroundColor: accent }}
            >
              {event.school}
            </span>
            <span className="font-mono text-[10px] text-slate-500">{event.event_code}</span>
            <span className="text-xs text-slate-500">{clubName}</span>
          </div>

          <h3 className="mt-2 font-display text-xl font-light text-white">{event.title}</h3>
          {event.tagline && <p className="text-sm text-slate-400">{event.tagline}</p>}

          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-400">
            {event.description}
          </p>

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
            <span>
              {new Date(event.start_at).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <span>{event.venue}</span>
            <span>
              {Number(event.registration_fee) === 0
                ? 'Free'
                : `₹${Number(event.registration_fee).toLocaleString('en-IN')}`}
            </span>
            <span>
              {event.coordinator_name} · {event.coordinator_phone}
            </span>
          </dl>

          {error && <p className="error-text">{error}</p>}

          {rejecting ? (
            <div className="mt-4 space-y-2">
              <textarea
                className="field min-h-[80px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What does the club need to fix? This is shown to them verbatim."
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy || reason.trim().length < 5}
                  onClick={() => decide('rejected', reason.trim())}
                  className="btn-ghost !px-4 !py-2 text-xs text-rose-300"
                >
                  Send back with notes
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="btn-ghost !px-4 !py-2 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !event.poster_url}
                onClick={() => decide('approved')}
                className="btn-primary !px-4 !py-2 text-xs"
              >
                Approve &amp; publish
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejecting(true)}
                className="btn-ghost !px-4 !py-2 text-xs text-rose-300"
              >
                Request changes
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={toggleFeatured}
                className="btn-ghost !px-4 !py-2 text-xs"
              >
                {event.is_featured ? '★ Featured' : '☆ Feature'}
              </button>
              {event.poster_url && (
                <a
                  href={event.poster_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !px-4 !py-2 text-xs"
                >
                  Full poster
                </a>
              )}
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="btn-ghost !px-4 !py-2 text-xs"
              >
                Edit
              </Link>
            </div>
          )}

          {!event.poster_url && (
            <p className="mt-2 text-xs text-rose-400">
              Cannot publish without a poster. Send it back.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
