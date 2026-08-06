import Link from 'next/link';
import EventCard from '@/components/EventCard';
import SectionHeader from '@/components/SectionHeader';
import SponsorStrip from '@/components/SponsorStrip';
import BlueprintMark from '@/components/BlueprintMark';
import { LogoMark } from '@/components/Logo';
import { HudDateStamp, HudDots, HudTicks, HudViewport } from '@/components/Hud';
import { FEST } from '@/lib/fest';
import { getFeaturedEvents } from '@/lib/data';

export const revalidate = 300;

export default async function HomePage() {
  const featured = await getFeaturedEvents(6);

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="scanlines relative min-h-[calc(100svh-72px)] overflow-hidden border-b border-white/10">
        <HudTicks />

        {/* blueprint mark, bleeding off the right edge */}
        <div className="pointer-events-none absolute -right-24 top-1/2 z-0 hidden -translate-y-1/2 lg:block">
          <BlueprintMark className="h-[min(78vh,780px)] w-auto text-white opacity-90" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-24 z-0 flex justify-center lg:hidden">
          <BlueprintMark className="h-[46vh] w-auto text-white opacity-20" />
        </div>

        {/* horizontal guide rules */}
        <div className="pointer-events-none absolute inset-x-0 top-[28%] h-px bg-white/[0.07]" />
        <div className="pointer-events-none absolute inset-y-0 left-[7%] hidden w-px bg-white/[0.05] lg:block" />

        <div className="container-x relative z-10 flex min-h-[calc(100svh-72px)] flex-col justify-center py-24">
          <div className="max-w-3xl">
            <div className="animate-fadeUp mb-6 flex items-center gap-4 sm:gap-5">
              <LogoMark size={56} />
              <h2 className="font-mono text-4xl font-black uppercase tracking-wide2 sm:text-6xl">
                <span className="text-white">V-TAPP</span>
                <span className="text-brand-500">26</span>
              </h2>
            </div>

            <div className="animate-fadeUp mb-8 flex flex-wrap items-center gap-4">
              <span className="tag-index">[00]</span>
              <span className="mono-label text-slate-400">
                {FEST.dateLabel.toUpperCase()} / {FEST.venue.toUpperCase()}
              </span>
            </div>

            <h1 className="animate-fadeUp display-xl text-balance">
              The Pinnacle
              <br />
              of <span className="text-brand-500">Innovation</span>
              <br />
              <span className="text-slate-500">and Creativity.</span>
            </h1>

            <p className="animate-fadeUp mt-9 max-w-lg text-base leading-relaxed text-slate-400">
              {FEST.fullName} at {FEST.university}. Two days, seven schools, one campus running at
              full throttle. Hackathons, combat robotics, pitch battles and everything in between.
            </p>

            <div className="animate-fadeUp mt-10 flex flex-wrap gap-3">
              <Link href="/tickets" className="btn-primary">
                Buy tickets
              </Link>
              <Link href="/events" className="btn-ghost">
                Explore events
              </Link>
            </div>

            <div className="animate-fadeUp mt-14">
              <HudDots count={12} />
            </div>
          </div>
        </div>

        {/* corner telemetry */}
        <div className="pointer-events-none absolute bottom-6 left-5 z-10 hidden sm:left-8 md:block">
          <HudViewport />
        </div>
        <div className="pointer-events-none absolute bottom-6 right-5 z-10 hidden sm:right-8 md:block">
          <HudDateStamp />
        </div>
      </section>

      {/* ==================== FEATURED EVENTS ==================== */}
      <section className="container-x mt-24">
        <SectionHeader
          index="01"
          slug="FEATURED"
          title="Headline events"
          description="The biggest draws across all seven schools. Registration opens as each club publishes."
          meta={`${featured.length} INDEXED`}
          action={
            <Link href="/events" className="btn-ghost !px-5 !py-2.5">
              All events
            </Link>
          }
        />

        {featured.length === 0 ? (
          <div className="panel brackets p-16 text-center">
            <p className="display-md">Events announced soon</p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
              Clubs are finalising their line-ups for this edition. The full list goes live here
              closer to {FEST.dateLabel}.
            </p>
          </div>
        ) : (
          <div className="grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e, i) => (
              <EventCard key={e.id} event={e} clubName={e.club?.name} priority={i < 3} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== SPONSORS ==================== */}
      <SponsorStrip />
    </>
  );
}
