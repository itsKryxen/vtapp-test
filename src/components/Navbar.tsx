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
      <nav className="container-x flex h-20 items-center justify-between gap-6 sm:h-[88px]">
        <Link href="/" className="group relative flex h-full items-center" aria-label="V-TAPP 2026 home">
          <LogoMark size={42} />
          {pathname === '/' && (
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-brand-600 shadow-[0_0_12px_rgb(179_40_33/.7)]" />
          )}
        </Link>

        <div className="hidden h-full items-center gap-6 xl:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex h-full items-center font-mono text-xs uppercase tracking-label transition-colors ${
                  active ? 'text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] bg-brand-600 shadow-[0_0_12px_rgb(179_40_33/.7)]" />
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
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-white/15 transition hover:border-white/40 xl:hidden"
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
        <div className="border-t border-white/10 bg-ink-950 xl:hidden">
          <div className="container-x flex flex-col py-2">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-4 border-b border-white/[0.06] py-4 font-mono text-xs uppercase tracking-label transition hover:text-white ${
                  pathname.startsWith(l.href) ? 'bg-brand-600/10 text-white' : 'text-slate-400'
                }`}
              >
                {pathname.startsWith(l.href) && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-600" />}
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
