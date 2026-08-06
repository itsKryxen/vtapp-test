import Link from 'next/link';
import { LogoLockup } from './Logo';
import { HudClock, HudDots } from './Hud';
import { FEST } from '@/lib/fest';
import { SocialLinks } from './SocialLinks';

const EXPLORE = [
  { href: '/events', label: 'All events' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/clubs', label: 'Clubs' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/team', label: 'Team' },
  { href: '/signal-breach', label: 'Signal Breach' },
  { href: '/about', label: 'About the fest' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/tickets/status', label: 'My orders' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/10 bg-ink-950">
      {/* index strip */}
      <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/[0.06] py-3">
        <span className="mono-label text-brand-500">V-TAPP / 2026</span>
        <span className="mono-label">{FEST.dateLabel.toUpperCase()}</span>
        <span className="mono-label hidden sm:inline">LAT 16.5062 · LON 80.6480</span>
        <span className="ml-auto">
          <HudClock />
        </span>
      </div>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.5fr_1fr]">
        {/* brand */}
        <div>
          <LogoLockup width={340} className="h-auto w-[240px] sm:w-[300px]" />

          <p className="mt-7 max-w-sm text-sm leading-relaxed text-slate-400">
            The international techfest of {FEST.university}. Two days, every school, one campus in
            Amaravati, Andhra Pradesh.
          </p>

          <div className="mt-8">
            <HudDots count={10} />
          </div>
        </div>

        {/* contact */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="tag-index">[02]</span>
            <span className="mono-label text-slate-400">CONTACT</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <dl className="space-y-5 text-sm">
            <div>
              <dt className="mono-label mb-1.5">EMAIL</dt>
              <dd>
                <a href={`mailto:${FEST.email}`} className="break-all text-slate-300 hover:text-white">
                  {FEST.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="mono-label mb-1.5">VENUE</dt>
              <dd className="leading-relaxed text-slate-300">
                {FEST.university}
                <br />
                Amaravati, Andhra Pradesh 522237
              </dd>
            </div>

            <div>
              <dt className="mono-label mb-1.5">DATES</dt>
              <dd className="font-mono text-xs uppercase tracking-label text-slate-300">
                {FEST.dateLabel}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-x grid gap-4 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <p className="mono-label">
            © {new Date().getFullYear()} {FEST.university.toUpperCase()}
          </p>
          <p className="mono-label text-slate-400 sm:text-center">{FEST.tagline.toUpperCase()}</p>
          <div className="justify-self-end">
            <SocialLinks placement="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
