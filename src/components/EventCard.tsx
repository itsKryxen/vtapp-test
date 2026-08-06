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
    | 'event_code'
  >;
  clubName?: string | null;
  priority?: boolean;
  /** Position in the grid, printed as the card's index tag. */
  index?: number;
}

/**
 * Event card, technical variant.
 *
 * No tilt, no glass, no rounding. The card is a hairline cell in a grid, the
 * poster sits behind a scrim, and every piece of metadata is monospaced and
 * tracked. Bracket corners appear on hover.
 */
export default function EventCard({ event, clubName, priority = false, index = 0 }: Props) {
  const accent = schoolAccent(event.school);
  const category = CATEGORIES.find((c) => c.value === event.category);
  const date = new Date(event.start_at);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="brackets group relative block bg-ink-950 transition-colors duration-200 hover:bg-ink-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-brand-500"
    >
      {/* ---- header strip ---- */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
        <span className="font-mono text-[10px] tracking-label text-slate-600">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-label"
          style={{ color: accent }}
        >
          {event.school}
        </span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-label text-slate-600">
          {event.event_code}
        </span>
      </div>

      {/* ---- poster, locked to the 4:5 spec ---- */}
      <div className="on-media relative aspect-[4/5] w-full overflow-hidden bg-ink-900">
        {event.thumbnail_url || event.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.thumbnail_url ?? event.poster_url ?? ''}
            alt={`${event.title} poster`}
            width={540}
            height={675}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="mono-label">NO POSTER</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

        {/* crosshair reticle that appears on hover */}
        <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-white/0 transition-colors duration-300 group-hover:border-white/70" />
        <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-white/0 transition-colors duration-300 group-hover:border-white/70" />

        {event.prize_pool ? (
          <span className="absolute right-3 top-3 border border-white/20 bg-ink-950/85 px-2 py-1 font-mono text-[10px] tracking-label text-white">
            ₹{Number(event.prize_pool).toLocaleString('en-IN')}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-4">
          {category && <p className="mono-label mb-2 text-slate-400">{category.label}</p>}
          <h3 className="font-display text-xl font-light leading-tight text-white">
            {event.title}
          </h3>
          {event.tagline && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-slate-400">
              {event.tagline}
            </p>
          )}
        </div>
      </div>

      {/* ---- meta table ---- */}
      <dl className="divide-y divide-white/[0.06] border-t border-white/[0.08]">
        <div className="flex items-center justify-between px-4 py-2.5">
          <dt className="mono-label">DATE</dt>
          <dd className="font-mono text-[11px] uppercase tracking-wide text-slate-300">
            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
            {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="mono-label">VENUE</dt>
          <dd className="truncate font-mono text-[11px] text-slate-300">{event.venue}</dd>
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="mono-label truncate">{clubName ? clubName.toUpperCase() : 'HOST'}</dt>
          <dd
            className="shrink-0 font-mono text-[11px] uppercase tracking-label"
            style={{ color: accent }}
          >
            {Number(event.registration_fee) === 0
              ? 'FREE'
              : `₹${Number(event.registration_fee).toLocaleString('en-IN')}`}
          </dd>
        </div>
      </dl>

      {/* accent bar that wipes in on hover */}
      <span
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
    </Link>
  );
}
