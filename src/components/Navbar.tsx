'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark } from './Logo';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/clubs', label: 'Clubs' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/team', label: 'Team' },
  { href: '/about', label: 'About' },
  { href: '/tickets', label: 'Tickets' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-white/10 bg-ink-950/92 backdrop-blur-sm' : 'border-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-6 sm:h-[72px]">
        {/* wordmark: mark + widely tracked lettering, as in the reference */}
        <Link href="/" className="group flex items-center gap-3" aria-label="V-TAPP 2026 home">
          <LogoMark size={26} />
          <span className="font-mono text-sm uppercase tracking-wide2 text-white">V-TAPP</span>
          <span className="hidden font-mono text-sm uppercase tracking-wide2 text-brand-500 sm:inline">
            26
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative font-mono text-[11px] uppercase tracking-label transition-colors ${
                  active ? 'text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute -bottom-2 left-0 h-px w-full bg-brand-600" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link href="/tickets" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
            Buy tickets
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-white/15 transition hover:border-white/40 lg:hidden"
          >
            <span
              className={`h-px w-4 bg-white transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`}
            />
            <span className={`h-px w-4 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span
              className={`h-px w-4 bg-white transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-950 lg:hidden">
          <div className="container-x flex flex-col py-2">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-4 border-b border-white/[0.06] py-3.5 font-mono text-[11px] uppercase tracking-label text-slate-400 transition hover:text-white"
              >
                <span className="text-brand-500">[{String(i + 1).padStart(2, '0')}]</span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
