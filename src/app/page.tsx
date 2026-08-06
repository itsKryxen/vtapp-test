import AndhraPradeshBinaryMap from '@/components/AndhraPradeshBinaryMap';
import HeroIdentity from '@/components/HeroIdentity';
import SponsorStrip from '@/components/SponsorStrip';
import { getSponsors } from '@/lib/data';
import Link from 'next/link';

const COUNTDOWN_TARGET = '2026-09-11T00:00:00+05:30';

export default async function HomePage() {
  const sponsors = await getSponsors();

  return (
    <>
      <section className="scanlines relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgb(var(--em-500)/.1),transparent_36%)]" />
        <HeroIdentity countdownTo={COUNTDOWN_TARGET} />
      </section>

      <AndhraPradeshBinaryMap />

      <section className="relative overflow-hidden border-y border-white/10 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgb(179_40_33/.16),transparent_35%)]" />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_.8fr]">
          <div>
            <div className="flex items-center gap-4">
              <span className="tag-index">[SB]</span>
              <span className="mono-label text-slate-400">SIGNAL BREACH</span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="mono-label">60 SEC</span>
            </div>
            <h2 className="display-lg mt-7 max-w-2xl">Can you break the sequence?</h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400">
              Watch the node grid transmit a signal, then reproduce it from memory. Six layers stand between you and access clearance.
            </p>
            <Link href="/signal-breach" className="btn-primary mt-8">
              Initialize breach <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="panel brackets scanlines relative mx-auto grid w-full max-w-lg grid-cols-4 gap-2 overflow-hidden p-5 sm:p-8" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => (
              <span
                key={index}
                className={`grid aspect-square place-items-center border font-mono text-[9px] ${index === 2 || index === 9 || index === 14 ? 'border-brand-400 bg-brand-600/25 text-brand-300 shadow-[0_0_22px_rgb(179_40_33/.45)]' : 'border-white/10 bg-ink-900/50 text-slate-700'}`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SponsorStrip initialSponsors={sponsors} />
    </>
  );
}
