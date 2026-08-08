import type { Metadata } from 'next';
import { PageHeader } from '@/components/SectionHeader';
import { FEST, STATS } from '@/lib/fest';
import { SCHOOLS } from '@/lib/schools';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${FEST.fullName} at ${FEST.university}.`,
};

export default function AboutPage() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader
        index="08"
        slug="ABOUT"
        title={<>{FEST.fullName}</>}
        description={<>{FEST.tagline}</>}
      />

      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-300">{FEST.blurb}</p>

      <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s, index) => (
          <div key={s.label} className="event-frame px-4 py-6 text-center">
            <span className="event-frame-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="font-display display-md text-white">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section className="event-frame p-6 sm:p-8">
          <span className="event-card-category-badge">ABOUT</span>
          <h2 className="text-2xl font-bold">What V-TAPP is</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>
              V-TAPP is the annual international techfest of {FEST.university}. Across two days the
              entire campus turns into a working floor, with hackathons in the labs, combat robotics in
              the open air theatre, pitch battles in the auditorium, and workshops running back to
              back in every block.
            </p>
            <p>
              Every event on this site is proposed, run and staffed by a registered student club.
              Clubs submit through their own portal; the core team reviews each submission before it
              is published here.
            </p>
          </div>
        </section>

        <section className="event-frame p-6 sm:p-8">
          <span className="event-card-category-badge">CAMPUS</span>
          <h2 className="text-2xl font-bold">Participating schools</h2>
          <ul className="mt-4 space-y-2.5">
            {SCHOOLS.filter((s) => s.code !== 'CENTRAL').map((s) => (
              <li key={s.code} className="flex items-baseline gap-3 text-sm">
                <span
                  className="w-16 shrink-0 font-display font-bold"
                  style={{ color: s.accent }}
                >
                  {s.code}
                </span>
                <span className="text-slate-300">{s.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="event-frame mt-16 p-8">
        <span className="event-card-category-badge">CONTACT</span>
        <h2 className="text-xl font-bold">Reach the core team</h2>
        <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <a href={`mailto:${FEST.email}`} className="text-brand-400 hover:underline">
              {FEST.email}
            </a>
          </div>
          <div>
            <p className="text-xs text-slate-500">Venue</p>
            <p className="text-slate-200">{FEST.venue}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Instagram</p>
            <a href={FEST.instagram} className="text-brand-400 hover:underline">
              @vtapp.vitap
            </a>
          </div>
          <div>
            <p className="text-xs text-slate-500">Website</p>
            <a href={FEST.website} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
              vitap.ac.in
            </a>
          </div>
        </div>
      </section>

      <section className="event-frame mt-16 p-8">
        <span className="event-card-category-badge">ARCHIVE</span>
        <h2 className="text-xl font-bold">A Glimpse of Previous V-TAPP</h2>
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="A Glimpse of Previous V-TAPP"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </div>
  );
}
