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
    <div className="container-x pb-20 pt-24 sm:pb-24 sm:pt-28">
      <PageHeader
        index="08"
        slug="ABOUT"
        title={<>{FEST.fullName}</>}
        description={<>{FEST.tagline}</>}
      />

      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-300">{FEST.blurb}</p>

      <div className="mt-12 grid grid-cols-2 border-y border-white/10 lg:grid-cols-4">
          {STATS.map((s, index) => (
            <div key={s.label} className="border-white/10 px-4 py-7 first:border-l-0 max-lg:even:border-l lg:border-l">
              <span className="mono-label text-brand-400" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">{s.value}</p>
              <p className="mono-label mt-2 text-slate-400">{s.label}</p>
            </div>
          ))}
      </div>

      <div className="mt-16 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-2">
        <section className="bg-ink-950 p-6 sm:p-9">
          <p className="mono-label text-brand-400">About</p>
          <h2 className="mt-4 text-2xl font-semibold">What V-TAPP is</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
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

        <section className="bg-ink-950 p-6 sm:p-9">
          <p className="mono-label text-brand-400">Campus</p>
          <h2 className="mt-4 text-2xl font-semibold">Participating schools</h2>
          <ul className="mt-5 space-y-3">
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

      <section className="mt-16 border-y border-white/10 py-8 sm:py-10">
          <p className="mono-label text-brand-400">Contact</p>
          <h2 className="mt-4 text-xl font-semibold">Reach the core team</h2>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
