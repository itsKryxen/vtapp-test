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

  const dateLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="event-card group relative flex flex-col">

      {/* ── Corner brackets (decorative) ── */}
      <div className="event-card-bracket event-card-bracket-tl" aria-hidden="true" />
      <div className="event-card-bracket event-card-bracket-tr" aria-hidden="true" />
      <div className="event-card-bracket event-card-bracket-bl" aria-hidden="true" />
      <div className="event-card-bracket event-card-bracket-br" aria-hidden="true" />

      {/* ── Technical background grid ── */}
      <div className="event-card-grid" aria-hidden="true" />

      {/* ── Top header row: index + status ── */}
      <div className="event-card-header">
        <span className="event-card-index" aria-label={`Event ${displayIndex}`}>
          {displayIndex}
        </span>
        <div className="event-card-status">
          <span className="event-card-status-dot" aria-hidden="true" />
          <span className="event-card-status-label">INDEXED</span>
        </div>
      </div>

      {/* ── Category badge ── */}
      <div className="event-card-badge-row">
        <span className="event-card-category-badge">
          {category?.label ?? event.category}
        </span>
      </div>

      {/* ── Main content: title + image ── */}
      <div className="event-card-body">
        {/* Left: title + description */}
        <div className="event-card-content">
          <h3 className="event-card-title">
            {event.title}
          </h3>
          {event.tagline && (
            <p className="event-card-tagline">
              {event.tagline}
            </p>
          )}
        </div>

        {/* Right: image panel */}
        <div className="event-card-image-panel">
          {event.thumbnail_url || event.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.thumbnail_url ?? event.poster_url ?? ''}
              alt={`${event.title} artwork`}
              loading={priority ? 'eager' : 'lazy'}
              className="event-card-image"
            />
          ) : (
            <div className="event-card-image-placeholder">
              <span aria-hidden="true">NO<br/>IMG</span>
            </div>
          )}
          {/* Subtle radial overlay over image */}
          <div className="event-card-image-overlay" aria-hidden="true" />
        </div>
      </div>

      {/* ── Metadata strip ── */}
      <div className="event-card-meta">
        {/* Date */}
        <div className="event-card-meta-item">
          <span className="event-card-meta-icon" aria-hidden="true">▣</span>
          <div>
            <div className="event-card-meta-value">
              {dateLabel}
            </div>
            <div className="event-card-meta-label">Date</div>
          </div>
        </div>

        {/* Prize pool — only if > 0 */}
        {prizePool > 0 && (
          <div className="event-card-meta-item">
            <span className="event-card-meta-icon" aria-hidden="true">🏆</span>
            <div>
              <div className="event-card-meta-value event-card-meta-prize">
                ₹{prizePool.toLocaleString('en-IN')}
              </div>
              <div className="event-card-meta-label">Prize Pool</div>
            </div>
          </div>
        )}

        {/* Registration fee */}
        <div className="event-card-meta-item">
          <span className="event-card-meta-icon" aria-hidden="true">◈</span>
          <div>
            <div className="event-card-meta-value">
              {fee === 0 ? 'Free' : `₹${fee}`}
            </div>
            <div className="event-card-meta-label">Entry</div>
          </div>
        </div>
      </div>

      {/* ── Action strip ── */}
      <div className="event-card-actions">
        <Link
          href={`/events/${event.slug}`}
          className="event-card-btn-explore"
          aria-label={`Explore ${event.title}`}
        >
          <span>Explore</span>
          <span className="event-card-btn-arrow" aria-hidden="true">→</span>
        </Link>
        <Link
          href={`/events/${event.slug}`}
          className="event-card-btn-register"
          aria-label={`Register for ${event.title}`}
        >
          <span>Register</span>
          <span className="event-card-btn-arrow" aria-hidden="true">↗</span>
        </Link>
      </div>

    </div>
  );
}
