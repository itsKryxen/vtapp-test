import EventCard from '@/components/EventCard';
import FestivalWorld from '@/components/FestivalWorld';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeader from '@/components/SectionHeader';
import SponsorStrip from '@/components/SponsorStrip';
import { getApprovedEvents, getFeaturedEvents, getSponsors } from '@/lib/data';
import { STATS } from '@/lib/fest';
import { CATEGORIES } from '@/lib/types';
import Link from 'next/link';

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export default async function HomePage() {
  const [sponsors, featuredEvents, events] = await Promise.all([
    getSponsors(),
    getFeaturedEvents(3),
    getApprovedEvents(),
  ]);

  const categories = CATEGORIES.filter((category) =>
    events.some((event) => event.category === category.value),
  );
  const nextEvents = [...events]
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, 4);
  const categoryCounts = events.reduce<Record<string, number>>((counts, event) => {
    counts[event.category] = (counts[event.category] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <>
      <FestivalWorld counts={categoryCounts} />

      <section className="border-b border-white/10 bg-ink-900/35">
        <div className="container-x grid grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 45} className="home-stat border-white/10 px-3 py-7 sm:px-6 sm:py-9">
              <strong className="block font-display text-3xl font-semibold text-white sm:text-4xl">{stat.value}</strong>
              <span className="mono-label mt-3 block text-slate-400">{stat.label}</span>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeader
              index="02"
              slug="FEATURED EVENTS"
              title="Start with the standouts"
              description="Flagship competitions selected across code, machines, and ideas. Every card shows the essentials before you commit."
              meta={`${featuredEvents.length} SELECTED`}
              action={<Link href="/events" className="btn-ghost">View all events</Link>}
            />
          </ScrollReveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredEvents.map((event, index) => (
              <ScrollReveal key={event.id} delay={index * 85} className="h-full">
                <EventCard event={event} clubName={event.club?.name} priority={index < 2} index={index} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-900/35 py-16 sm:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <ScrollReveal>
            <p className="mono-label text-brand-400">Find your arena</p>
            <h2 className="display-md mt-5">One fest. Multiple disciplines.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Browse only the tracks currently represented in the published programme.
            </p>
          </ScrollReveal>
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((category, index) => {
              const count = events.filter((event) => event.category === category.value).length;
              return (
                <ScrollReveal key={category.value} delay={index * 55}>
                  <Link href={`/events?category=${category.value}`} className="category-link">
                    <span className="mono-label text-brand-400">{String(index + 1).padStart(2, '0')}</span>
                    <span className="font-display text-lg font-semibold text-white">{category.label}</span>
                    <span className="ml-auto font-mono text-xs text-slate-500">{String(count).padStart(2, '0')}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeader
              index="03"
              slug="RUNNING ORDER"
              title="Plan both days"
              description="A quick look at the opening programme. The full schedule includes every published event and venue."
              action={<Link href="/schedule" className="btn-ghost">Full schedule</Link>}
            />
          </ScrollReveal>
          <ol className="schedule-preview border-t border-white/15">
            {nextEvents.map((event, index) => (
              <ScrollReveal key={event.id} delay={index * 65}>
                <li>
                  <Link href={`/events/${event.slug}`} className="schedule-preview-row">
                    <span className="font-mono text-xs text-brand-400">{time(event.start_at)}</span>
                    <span>
                      <strong className="block text-base font-semibold text-white">{event.title}</strong>
                      <span className="mt-1 block text-xs text-slate-500">{event.venue}</span>
                    </span>
                    <span className="hidden font-mono text-[10px] uppercase tracking-label text-slate-500 sm:block">{event.category}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-900/35 py-16 sm:py-20">
        <ScrollReveal className="container-x grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mono-label text-brand-400">Interactive challenge · 60 seconds</p>
            <h2 className="display-md mt-5 max-w-2xl">Can you break the sequence?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Watch the node grid transmit a signal, then reproduce it from memory. Six layers stand between you and access clearance.
            </p>
          </div>
          <Link href="/signal-breach" className="btn-ghost shrink-0">Initialize breach <span aria-hidden="true">→</span></Link>
        </ScrollReveal>
      </section>

      <section className="registration-cta py-16 sm:py-24">
        <ScrollReveal className="container-x">
          <div className="registration-cta-inner">
            <div>
              <p className="mono-label text-brand-400">Registration is open</p>
              <h2 className="display-md mt-5">Your V-TAPP run starts here.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Get your fest pass, shortlist your events, and arrive ready for two full days at VIT-AP University.
              </p>
            </div>
            <Link href="/tickets" className="btn-primary shrink-0">Get tickets <span aria-hidden="true">→</span></Link>
          </div>
        </ScrollReveal>
      </section>

      <SponsorStrip initialSponsors={sponsors} />
    </>
  );
}
