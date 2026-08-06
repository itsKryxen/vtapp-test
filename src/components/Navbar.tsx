'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogoLockup } from './Logo';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/clubs', label: 'Clubs' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/team', label: 'Team' },
  { href: '/merch', label: 'Merch' },
  // { href: '/signal-breach', label: 'Play' },
  { href: '/about', label: 'About' },
  // { href: '/tickets', label: 'Tickets' },
];

const TOP_LINKS = LINKS.slice(0, 2);
const SIDE_LINKS = LINKS.slice(2);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950">
        <nav className="container-x relative flex h-20 items-center gap-3 !px-5 sm:h-[88px] sm:!px-8">
          <div className="flex h-full shrink-0 items-center gap-3 sm:gap-5">
            <Link href="/" className="group relative flex h-full items-center" aria-label="V-TAPP 2026 home">
              <motion.span
                layoutId="vtapp-navigation-wordmark"
                data-navbar-logo-target
                className="block w-[112px] sm:w-[142px]"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <LogoLockup width={142} priority className="h-auto w-full" />
              </motion.span>
              {pathname === '/' && (
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-brand-600 shadow-[0_0_12px_rgb(179_40_33/.7)]" />
              )}
            </Link>

            <span className="hidden h-8 w-px bg-white/10 min-[430px]:block" aria-hidden="true" />
            <Image
              src="/vit-ap-university-logo.png"
              alt="VIT-AP University"
              width={740}
              height={197}
              priority
              className="hidden h-auto w-24 min-[430px]:block sm:w-36"
            />
          </div>

          <div className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-8 xl:flex">
            {TOP_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex h-full items-center font-mono text-xs uppercase tracking-label transition-colors ${
                    active ? 'text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-[3px] bg-brand-600 shadow-[0_0_12px_rgb(179_40_33/.7)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link href="/tickets" className="btn-primary !px-3 !py-2.5 sm:!px-5">
              <span className="sm:hidden">Buy</span>
              <span className="hidden sm:inline">Buy tickets</span>
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

      <aside className="navigation-rail" aria-label="Primary navigation">
        <nav className="navigation-rail-links">
          {SIDE_LINKS.map((link, index) => {
            const active = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`navigation-rail-link ${active ? 'is-active' : ''}`}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
