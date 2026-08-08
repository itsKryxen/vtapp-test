'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LogoLockup } from './Logo';
import ThemeToggle from './ThemeToggle';

const PRIMARY_LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/about', label: 'About' },
  { href: '/clubs', label: 'Clubs' },
  { href: '/sponsors', label: 'Sponsors' },
];

const SECONDARY_LINKS = [
  { href: '/team', label: 'Team' },
  { href: '/merch', label: 'Merch' },
  { href: '/signal-breach', label: 'Signal Breach' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const firstLink = menuRef.current?.querySelector<HTMLElement>('a');
    firstLink?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/15 bg-ink-950/95 backdrop-blur-xl">
      <nav className="container-x flex h-[72px] items-center gap-4 !px-4 sm:h-20 sm:!px-8" aria-label="Primary navigation">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="V-TAPP 2026 home">
          <span data-navbar-logo-target className="block w-[104px] sm:w-[132px]">
            <LogoLockup width={142} priority className="h-auto w-full" />
          </span>
          <span className="h-7 w-px bg-white/15" aria-hidden="true" />
          <Image
            src="/vit-ap-university-logo.png"
            alt="VIT-AP University"
            width={740}
            height={197}
            priority
            className="h-auto w-[88px] sm:w-[118px]"
          />
        </Link>

        <div className="ml-auto hidden items-center gap-1 xl:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`site-nav-link ${isActive(link.href) ? 'is-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <span className="nav-system-status" aria-label="Festival network online">
            <i aria-hidden="true" /> SYSTEM ONLINE
          </span>
          <ThemeToggle />
          <Link href="/tickets" className="btn-primary ml-2 !px-5 !py-3">
            Get tickets
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="menu-trigger ml-auto grid h-11 w-11 shrink-0 place-items-center border border-white/20 xl:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span className={`absolute left-0 top-0 h-px w-5 bg-white transition-transform duration-200 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`absolute left-0 top-[7px] h-px w-5 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 top-[14px] h-px w-5 bg-white transition-transform duration-200 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>

      <div
        id="mobile-navigation"
        ref={menuRef}
        aria-hidden={!open}
        className={`mobile-navigation fixed inset-x-0 top-[72px] h-[calc(100dvh-72px)] overflow-y-auto border-t border-white/15 bg-ink-950 transition-[opacity,transform] duration-200 sm:top-20 sm:h-[calc(100dvh-80px)] xl:hidden ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        <div className="container-x flex min-h-full flex-col py-6">
          <p className="mono-label mb-3 text-brand-400">Navigate V-TAPP</p>
          <div className="grid gap-px border-y border-white/10 bg-white/10">
            {PRIMARY_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`mobile-nav-link ${isActive(link.href) ? 'is-active' : ''}`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {link.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {SECONDARY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} tabIndex={open ? 0 : -1} className="mobile-nav-secondary">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
            <Link href="/tickets" tabIndex={open ? 0 : -1} className="btn-primary w-full">
              Get tickets <span aria-hidden="true">→</span>
            </Link>
            <div className="mobile-theme-row">
              <div className="mobile-system-status" aria-label="Festival network online">
                <i aria-hidden="true" /> FESTIVAL NETWORK ONLINE
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
