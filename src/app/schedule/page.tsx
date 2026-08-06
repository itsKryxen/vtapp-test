import Link from 'next/link';
import { PageHeader } from '@/components/SectionHeader';
import type { Metadata } from 'next';
import { getApprovedEvents } from '@/lib/data';
import { schoolAccent } from '@/lib/schools';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'The full two-day running order for V-TAPP 2026.',
};

export const revalidate = 120;

export default async function SchedulePage() {
  const events = await getApprovedEvents();

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
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="04"
        slug="SCHEDULE"
        title={<>Schedule</>}
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
              <h2 className="sticky top-20 z-10 -mx-2 mb-5 bg-ink-950/80 px-2 py-2 font-display display-md backdrop-blur">
                {day}
              </h2>

              <ol className="relative space-y-3 border-l border-white/10 pl-6">
                {list.map((e) => {
                  const accent = schoolAccent(e.school);
                  return (
                    <li key={e.id} className="relative">
                      <span
                        className="absolute -left-[27px] top-5 h-2.5 w-2.5 rounded-full ring-4 ring-ink-950"
                        style={{ backgroundColor: accent }}
                      />
                      <Link
                        href={`/events/${e.slug}`}
                        className="panel flex flex-wrap items-center gap-x-5 gap-y-1 p-4 transition hover:border-white/25"
                      >
                        <span className="w-20 shrink-0 font-mono text-sm tabular-nums text-slate-300">
                          {new Date(e.start_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-white">{e.title}</span>
                          <span className="block text-xs text-slate-500">
                            {e.venue} · {e.club?.name ?? e.club_id}
                          </span>
                        </span>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-ink-950"
                          style={{ backgroundColor: accent }}
                        >
                          {e.school}
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
