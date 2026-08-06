import Link from 'next/link';
import { schoolAccent } from '@/lib/schools';
import { CATEGORIES, type EventRecord } from '@/lib/types';

interface Props {
  event: Pick<
    EventRecord,
    | 'id'
    | 'slug'
    | 'title'
    | 'tagline'
    | 'category'
    | 'school'
    | 'start_at'
    | 'venue'
    | 'thumbnail_url'
    | 'poster_url'
    | 'registration_fee'
    | 'prize_pool'
  >;
  clubName?: string | null;
  priority?: boolean;
  /** Position in the event index. */
  index?: number;
}

/**
 * Event card styled as a compact event dossier: poster first, then a clear
 * typographic hierarchy and a small grid of useful registration details.
 */
export default function EventCard({ event, clubName, priority = false, index = 0 }: Props) {
  const accent = schoolAccent(event.school);
  const category = CATEGORIES.find((item) => item.value === event.category);
  const date = new Date(event.start_at);
  const displayIndex = String(index + 1).padStart(2, '0');
  const fee = Number(event.registration_fee);
  const prizePool = Number(event.prize_pool);

  const dateLabel = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
  const timeLabel = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <Link
      href={`/events/${event.slug}`}
      aria-label={`View ${event.title} event details`}
      className="event-card brackets group relative flex h-full flex-col focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
    >
      <div className="flex h-11 items-center border-b border-white/[0.08]">
        <span className="grid h-full w-12 place-items-center border-r border-white/[0.08] font-mono text-[10px] tracking-label text-brand-400">
          {displayIndex}
        </span>
        <span className="px-3 font-mono text-[9px] uppercase tracking-label text-slate-500">
          Event dossier
        </span>
        <span className="ml-auto h-1.5 w-1.5 bg-brand-500" aria-hidden="true" />
        <span className="mx-3 font-mono text-[8px] uppercase tracking-label text-slate-600">
          Indexed
        </span>
      </div>

      <div className="on-media relative aspect-[4/5] overflow-hidden bg-ink-900">
        {event.thumbnail_url || event.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.thumbnail_url ?? event.poster_url ?? ''}
            alt={`${event.title} poster`}
            width={540}
            height={675}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover opacity-90 saturate-[0.88] transition duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100 group-hover:saturate-100"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,rgb(var(--ink-900)),rgb(var(--ink-950)))]">
            <div className="text-center">
              <p className="font-display text-5xl font-extralight text-white/10">{displayIndex}</p>
              <p className="mono-label mt-3">Poster pending</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgb(var(--ink-950)/.92)_100%)]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
          style={{ backgroundColor: accent }}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/15" />

        {prizePool > 0 && (
          <div className="absolute bottom-0 right-0 border-l border-t border-white/15 bg-ink-950/90 px-3 py-2 backdrop-blur-md">
            <p className="font-mono text-[8px] uppercase tracking-label text-slate-500">Prize pool</p>
            <p className="mt-1 font-mono text-[11px] text-white">
              ₹{prizePool.toLocaleString('en-IN')}
            </p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-label text-white/70">
            {category?.label ?? event.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-white/[0.08]">
        <div className="flex-1 px-5 py-5">
          <h3 className="font-display text-[1.65rem] font-light leading-[1.05] tracking-tight text-white transition-colors duration-200 group-hover:text-brand-300">
            {event.title}
          </h3>
          {event.tagline && (
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
              {event.tagline}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 border-t border-white/[0.08]">
          <div className="border-r border-white/[0.08] px-4 py-3.5">
            <dt className="mono-label">Date / time</dt>
            <dd className="mt-2 font-mono text-[11px] uppercase tracking-wide text-slate-200">
              <time dateTime={event.start_at}>{dateLabel} · {timeLabel}</time>
            </dd>
          </div>
          <div className="min-w-0 px-4 py-3.5">
            <dt className="mono-label">Venue</dt>
            <dd className="mt-2 truncate font-mono text-[11px] text-slate-200" title={event.venue}>
              {event.venue}
            </dd>
          </div>
        </dl>

        <div className="flex min-h-14 items-center border-t border-white/[0.08] px-4">
          <div className="min-w-0">
            <p className="mono-label">Hosted by</p>
            <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-slate-300">
              {clubName ?? 'V-TAPP'}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-4 pl-4">
            <span className="font-mono text-[11px] uppercase tracking-label" style={{ color: accent }}>
              {fee === 0 ? 'Free' : `₹${fee.toLocaleString('en-IN')}`}
            </span>
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center border border-white/15 text-sm text-white transition-all duration-200 group-hover:border-brand-500 group-hover:bg-brand-600 group-hover:text-white"
            >
              ↗
            </span>
          </div>
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
    </Link>
  );
}
