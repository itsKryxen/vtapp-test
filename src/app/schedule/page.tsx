import Link from 'next/link';
import { PageHeader } from '@/components/SectionHeader';
import type { Metadata } from 'next';
import { getApprovedEvents } from '@/lib/data';
import { schoolAccent } from '@/lib/schools';
import { CATEGORIES } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'The full two-day running order for V-TAPP 2026.',
};

export const revalidate = 120;

export default async function SchedulePage() {
  const events = await getApprovedEvents();
  events.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const byDay = new Map<string, typeof events>();
  for (const e of events) {
    const key = new Date(e.start_at).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }

  return (
    <div className="container-x pb-20 pt-24 sm:pb-24 sm:pt-28">
      <PageHeader
        index="04"
        slug="SCHEDULE"
        title={<>Schedule</>}
        description="A day-by-day running order with times, venues, and event tracks. Open an event for registration details and rules."
        meta={`${events.length} EVENTS`}
      />

      {byDay.size === 0 ? (
        <div className="panel mt-10 p-16 text-center">
          <p className="font-display text-xl font-light text-white">Schedule announced soon</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            The running order is published once clubs lock in their slots.
          </p>
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          {[...byDay.entries()].map(([day, list]) => (
            <section key={day}>
              <div className="sticky top-[72px] z-20 -mx-5 mb-5 flex items-center justify-between border-y border-white/15 bg-ink-950/95 px-5 py-3 backdrop-blur sm:top-20 sm:mx-0 sm:border-x-0">
                <h2 className="font-display text-lg font-semibold text-white sm:text-2xl">{day}</h2>
                <span className="mono-label">{String(list.length).padStart(2, '0')} EVENTS</span>
              </div>

              <ol className="relative space-y-3 border-l border-white/30 pl-6">
                {list.map((e) => {
                  const accent = schoolAccent(e.school);
                  const category = CATEGORIES.find((item) => item.value === e.category)?.label ?? e.category;
                  return (
                    <li key={e.id} className="relative">
                      <span
                        className="absolute -left-[27px] top-5 h-2.5 w-2.5 rounded-full ring-4 ring-ink-950"
                        style={{ backgroundColor: accent }}
                      />
                      <Link
                        href={`/events/${e.slug}`}
                        className="schedule-card panel grid grid-cols-[4.6rem_1fr_auto] items-center gap-3 p-4 transition hover:border-white/30"
                      >
                        <span className="w-20 shrink-0 font-mono text-sm tabular-nums text-slate-300">
                          {new Date(e.start_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-white">{e.title}</span>
                          <span className="block text-xs text-slate-500">
                            {e.venue} · {e.club?.name ?? e.club_id}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-mono text-[9px] uppercase tracking-label" style={{ color: accent }}>{e.school}</span>
                          <span className="mt-1 block font-mono text-[9px] uppercase tracking-label text-slate-500">{category}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
