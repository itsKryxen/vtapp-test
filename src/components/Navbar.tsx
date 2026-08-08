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
      <header className="sticky top-0 z-50 border-b border-white/30 bg-ink-950">
        <nav className="container-x relative flex h-16 items-center gap-2 !px-3 sm:h-[88px] sm:gap-3 sm:!px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:h-full sm:flex-none sm:gap-5">
            <Link href="/" className="group relative flex h-full items-center" aria-label="V-TAPP 2026 home">
              <motion.span
                layoutId="vtapp-navigation-wordmark"
                data-navbar-logo-target
                className="block w-[96px] min-[360px]:w-[108px] sm:w-[142px]"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <LogoLockup width={142} priority className="h-auto w-full" />
              </motion.span>
              {pathname === '/' && (
                <span className="absolute bottom-[2px] left-[7%] h-[2px] w-[40%] bg-[var(--brand)] shadow-[0_0_8px_var(--brand-glow)] sm:bottom-auto sm:top-[calc(50%+14px)]" />
              )}
            </Link>

            <span className="h-7 w-px shrink-0 bg-white/10 sm:h-8" aria-hidden="true" />
            <Image
              src="/vit-ap-university-logo.png"
              alt="VIT-AP University"
              width={740}
              height={197}
              priority
              className="h-auto min-w-0 w-[82px] min-[360px]:w-[94px] sm:w-36"
            />
          </div>

          {/* Events and Schedule are the two destinations the fest actually runs
           * on, so they get a HUD chip instead of the plain rail treatment. */}
          <div className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-3 xl:flex">
            {TOP_LINKS.map((link, index) => {
              const active = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-feature-link${active ? ' is-active' : ''}`}
                >
                  <span className="nav-feature-link-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="nav-feature-link-label">{link.label}</span>
                  <span className="nav-feature-link-bar" aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 xl:flex">
              <ThemeToggle />
              <Link href="/tickets" className="btn-primary !px-5 !py-2.5">
                Buy tickets
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] border border-white/15 transition hover:border-white/40 xl:hidden"
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
          <div className="border-t border-white/30 bg-ink-950 xl:hidden">
            <div className="container-x flex flex-col py-3">
              {pathname !== '/' && (
                <div className="grid grid-cols-3 gap-2 border-b border-white/[0.08] pb-3">
                  {TOP_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
                      className={`nav-feature-link min-w-0 !justify-center !px-1 !text-[9px] !tracking-[0.08em] ${
                        pathname.startsWith(link.href) ? 'is-active' : ''
                      }`}
                    >
                      <span className="nav-feature-link-label">{link.label}</span>
                      <span className="nav-feature-link-bar" aria-hidden="true" />
                    </Link>
                  ))}
                  <Link href="/tickets" className="btn-primary flex !min-h-0 !px-2 !py-2.5">
                    Buy
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-white/[0.08] py-3">
                <span className="font-mono text-[10px] uppercase tracking-label text-slate-400">Theme</span>
                <ThemeToggle />
              </div>

              {SIDE_LINKS.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative flex items-center gap-4 border-b border-white/[0.06] py-4 font-mono text-xs uppercase tracking-label transition hover:text-white ${
                    pathname.startsWith(l.href) ? 'bg-brand-600/10 text-white' : 'text-slate-400'
                  }`}
                >
                  {pathname.startsWith(l.href) && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-600" />}
                  <span className="text-brand-500">[{String(i + 3).padStart(2, '0')}]</span>
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
