'use client';

import Image from 'next/image';
import Countdown from '@/components/Countdown';
import Link from 'next/link';
import newLogo from '../../public/downloaded-logo.png';

export default function HeroIdentityLight({ countdownTo }: { countdownTo: string }) {
  return (
    <div className="container-x relative hidden min-h-[calc(100svh-88px)] w-full flex-col items-center justify-center py-20 light:flex">
      {/* Light Theme Background Geometry */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle grid and lines */}
        <div className="absolute left-[10%] top-0 h-full w-px bg-[var(--brand)]/10" />
        <div className="absolute left-[90%] top-0 h-full w-px bg-[var(--brand)]/10" />
        <div className="absolute top-[20%] h-px w-full bg-[var(--brand)]/10" />
        <div className="absolute top-[80%] h-px w-full bg-[var(--brand)]/10" />
        <div className="absolute left-1/2 top-[10%] h-px w-10 -translate-x-1/2 bg-[var(--brand)]/30" />
        <div className="absolute left-1/2 bottom-[10%] h-px w-10 -translate-x-1/2 bg-[var(--brand)]/30" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-[var(--brand)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-label text-[var(--brand)]">4TH EDITION</span>
          <span className="h-px w-8 bg-[var(--brand)]" />
        </div>

        {/* Large Logo */}
        <div className="mb-10 w-full max-w-xl xl:max-w-2xl px-4">
          <Image
            src={newLogo}
            alt="V-TAPP Logo"
            style={{ width: 800, height: 'auto' }}
            priority
            className="h-auto w-full object-contain drop-shadow-[0_0_30px_rgba(0,229,255,0.15)]"
          />
        </div>

        {/* Headlines */}
        <h1 className="font-display text-3xl font-light uppercase tracking-wide text-ink-950 sm:text-5xl md:text-6xl">
          Celebrate <span className="font-bold text-[var(--brand)]">Technology</span>
        </h1>
        
        <div className="mt-8 flex flex-col items-center gap-3 font-mono text-sm uppercase tracking-label text-slate-500 sm:flex-row sm:gap-6">
          <span>VIT-AP UNIVERSITY</span>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)] sm:block shadow-[0_0_10px_var(--brand-secondary)]" />
          <span>11—12 SEPTEMBER 2026</span>
        </div>

        {/* Actions & Countdown */}
        <div className="mt-16 flex w-full max-w-4xl flex-col items-center gap-10 rounded-sm border border-[var(--brand)]/20 bg-white/50 p-8 backdrop-blur-md shadow-2xl shadow-[var(--brand)]/5">
          <div className="w-full">
            <Countdown to={countdownTo} variant="timeline" />
          </div>
          
          <div className="mt-4 flex w-full flex-col justify-center gap-4 sm:flex-row">
            <Link href="/tickets" className="btn-primary w-full sm:w-auto !px-10 !py-3.5 text-sm font-bold tracking-label uppercase">
              Get Tickets
            </Link>
            <Link href="/events" className="btn-ghost w-full sm:w-auto !px-10 !py-3.5 text-sm tracking-label uppercase">
              Explore Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
