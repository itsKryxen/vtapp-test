import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventBySlug } from '@/lib/data';
import { getSchool, schoolAccent } from '@/lib/schools';
import { CATEGORIES } from '@/lib/types';
import Icon3D from '@/components/Icon3D';

export const revalidate = 120;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: 'Event not found' };
  return {
    title: event.title,
    description: event.tagline ?? event.description.slice(0, 155),
    openGraph: {
      title: event.title,
      description: event.tagline ?? undefined,
      images: event.poster_url ? [{ url: event.poster_url, width: 1080, height: 1350 }] : undefined,
    },
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export default async function EventDetailPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const accent = schoolAccent(event.school);
  const school = getSchool(event.school);
  const category = CATEGORIES.find((c) => c.value === event.category);

  const teamLabel =
    event.team_type === 'solo'
      ? 'Solo'
      : event.team_type === 'team'
        ? `Teams of ${event.team_min}–${event.team_max}`
        : `Solo or teams up to ${event.team_max}`;

  const facts = [
    { label: 'Starts', value: fmtDate(event.start_at), icon: 'clock' },
    { label: 'Ends', value: fmtDate(event.end_at), icon: 'hourglass' },
    { label: 'Venue', value: event.venue, icon: 'pin' },
    { label: 'Team size', value: teamLabel, icon: 'users' },
    {
      label: 'Entry fee',
      icon: 'ticket',
      value: Number(event.registration_fee) === 0
        ? 'Free'
        : `₹${Number(event.registration_fee).toLocaleString('en-IN')}`,
    },
    ...(event.max_participants
      ? [{ label: 'Seats', value: String(event.max_participants), icon: 'seat' }]
      : []),
    ...(event.prize_pool
      ? [{
          label: 'Prize pool',
          value: `₹${Number(event.prize_pool).toLocaleString('en-IN')}`,
          icon: 'trophy',
        }]
      : []),
  ];

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <Link href="/events" className="text-xs text-slate-400 hover:text-white">
        ← All events
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---------------- poster ---------------- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden border border-white/30">
            <div className="on-media relative aspect-[4/5] w-full bg-ink-800">
              {event.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.poster_url}
                  alt={`${event.title} poster`}
                  width={1080}
                  height={1350}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-600">
                  Poster coming soon
                </div>
              )}
              <div
                className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                style={{ background: `linear-gradient(140deg, ${accent}, transparent 60%)` }}
              />
            </div>
          </div>

          <Link href="/tickets" className="btn-primary mt-4 w-full">
            Get a ticket
          </Link>

          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-3 w-full"
            >
              Club registration form
            </a>
          )}
          {event.registration_deadline && (
            <p className="mt-2 text-center text-xs text-slate-500">
              Registration closes {fmtDate(event.registration_deadline)}
            </p>
          )}
        </div>

        {/* ---------------- content ---------------- */}
        <div>
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-950"
              style={{ backgroundColor: accent }}
            >
              {event.school}
            </span>
            {category && (
              <span className="chip">
                <Icon3D name={category.value} size={14} flat />
                {category.label}
              </span>
            )}
            <span className="chip font-mono text-[10px]">{event.event_code}</span>
          </div>

          <h1 className="display-lg mt-5">{event.title}</h1>
          {event.tagline && (
            <p className="mt-3 text-lg text-slate-300">{event.tagline}</p>
          )}

          <p className="mt-4 text-sm text-slate-400">
            Hosted by <span className="font-medium text-white">{event.club?.name ?? event.club_id}</span>
            {school && <> · {school.name}</>}
          </p>

          {/* fact grid */}
          <dl className="panel mt-8 grid grid-cols-2 gap-px overflow-hidden bg-white/[0.06] sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="bg-ink-900/80 px-4 py-4">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <Icon3D name={f.icon} size={15} />
                  {f.label}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-white">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-bold">About this event</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-300">
              {event.description.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {event.rules && (
            <section className="mt-10">
              <h2 className="text-xl font-bold">Rules</h2>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
                {event.rules.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} className="flex gap-2.5">
                    <span style={{ color: accent }}>▸</span>
                    <span>{line.replace(/^[-•*]\s*/, '')}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {event.prizes && (
            <section className="mt-10">
              <h2 className="text-xl font-bold">Prizes</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{event.prizes}</p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-bold">Contact</h2>
            <div className="panel mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 p-5 text-sm">
              <div>
                <p className="text-xs text-slate-500">Coordinator</p>
                <p className="font-medium text-white">{event.coordinator_name}</p>
              </div>
              <a href={`tel:${event.coordinator_phone}`} className="text-brand-400 hover:underline">
                {event.coordinator_phone}
              </a>
              <a href={`mailto:${event.coordinator_email}`} className="text-brand-400 hover:underline">
                {event.coordinator_email}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
