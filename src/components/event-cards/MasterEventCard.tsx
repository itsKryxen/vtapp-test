import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';
import type { EventCardProps } from './types';

/**
 * MasterEventCard — the single unified event card for all V-TAPP events.
 *
 * Dark theme:  BLACK + TECH FEST RED  (#D62828)
 * Light theme: WHITE + V-TAP BLUE    (#159BD7)
 *
 * The structure never changes; only event content changes.
 */
export default function MasterEventCard({ event, priority = false, index = 0 }: EventCardProps) {
  const category = CATEGORIES.find((item) => item.value === event.category);
  const date = new Date(event.start_at);
  const displayIndex = String(index + 1).padStart(2, '0');
  const prizePool = Number(event.prize_pool ?? 0);
  const fee = Number(event.registration_fee ?? 0);
  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const registrationOpen = Boolean(event.registration_url && (!deadline || deadline.getTime() > Date.now()));
  const teamLabel = event.team_type === 'solo' ? 'Solo' : `${event.team_min}–${event.team_max} people`;

  const dateLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <article className="event-card event-card-simple group" style={{ animationDelay: `${Math.min(index, 5) * 35}ms` }}>
      <header className="event-card-simple-header">
        <div className="flex items-center gap-3">
          <span className="event-card-index" aria-label={`Event ${displayIndex}`}>{displayIndex}</span>
          <span className="event-card-category-simple">{category?.label ?? event.category}</span>
        </div>
        <span className={`event-card-availability ${registrationOpen ? 'is-open' : ''}`}>
          {registrationOpen ? 'Registration open' : 'Details live'}
        </span>
      </header>

      <div className="event-card-simple-body">
        <div className="min-w-0 flex-1">
          <h3 className="event-card-simple-title">{event.title}</h3>
          {event.tagline && <p className="event-card-simple-tagline">{event.tagline}</p>}
        </div>

        {(event.thumbnail_url || event.poster_url) && (
          <div className="event-card-simple-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.thumbnail_url ?? event.poster_url ?? ''}
              alt={`${event.title} artwork`}
              loading={priority ? 'eager' : 'lazy'}
              className="event-card-simple-image"
            />
          </div>
        )}
      </div>

      <dl className="event-card-simple-facts">
        <div><dt>Date</dt><dd>{dateLabel}</dd></div>
        <div><dt>Time</dt><dd>{date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</dd></div>
        <div><dt>Venue</dt><dd>{event.venue}</dd></div>
        <div><dt>Entry</dt><dd>{fee === 0 ? 'Free' : `₹${fee}`}</dd></div>
      </dl>

      <footer className="event-card-simple-footer">
        <span>{teamLabel}{prizePool > 0 ? ` · ₹${prizePool.toLocaleString('en-IN')} prize pool` : ''}</span>
        <Link href={`/events/${event.slug}`} aria-label={`View details for ${event.title}`}>
          View details <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </article>
  );
}
