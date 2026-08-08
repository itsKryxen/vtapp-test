import Link from 'next/link';
import { LogoLockup } from './Logo';
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
    <footer className="relative z-10 border-t border-white/10 bg-ink-950">
      <div className="footer-network-bar" aria-hidden="true">
        <span><i /> FESTIVAL NETWORK ONLINE</span>
        <span>06 DISTRICTS / 01 CORE / V-TAPP 2026</span>
        <span>VIT-AP · AMARAVATI</span>
      </div>
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.2fr_.8fr_.8fr] sm:py-16">
        <div>
          <LogoLockup width={300} className="h-auto w-[220px] sm:w-[260px]" />

          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
            The international techfest of {FEST.university}. Two days, every school, one campus in
            Amaravati, Andhra Pradesh.
          </p>
        </div>

        <div>
          <p className="mono-label mb-5 text-slate-400">Explore</p>
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3" aria-label="Footer navigation">
            {EXPLORE.slice(0, 8).map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="mono-label mb-5 text-slate-400">Contact</p>

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
