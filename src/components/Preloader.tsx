'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const LINES = [
  'INIT VT26 DASHBOARD',
  'AUTHENTICATING SESSION',
  'RESOLVING CLUB PROFILE',
  'INDEXING EVENT SUBMISSIONS',
  'CALIBRATING PORTAL',
  'READY',
];

const SESSION_KEY = 'vtapp-dashboard-booted';

/**
 * Dashboard Boot sequence.
 *
 * A full-screen overlay in the blueprint drafting language for Dashboard & Admin pages:
 * the V mark strokes itself on while a mono log prints and a progress rule fills.
 */
export default function Preloader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  useEffect(() => {
    if (!isDashboard) {
      setShow(false);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let booted = false;
    try {
      booted = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // storage blocked: treat as a fresh boot
    }

    if (reduced || booted) return;

    setShow(true);
    document.body.style.overflow = 'hidden';

    const push = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

    LINES.forEach((_, i) => {
      push(() => {
        setStep(i + 1);
        setPct(Math.round(((i + 1) / LINES.length) * 100));
      }, 220 + i * 250);
    });

    const total = 220 + LINES.length * 250 + 300;
    push(() => setLeaving(true), total);
    push(() => {
      setShow(false);
      document.body.style.overflow = '';
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    }, total + 500);

    return () => {
      timers.current.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, [pathname, isDashboard]);

  if (!isDashboard || !show) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink-950 transition-opacity duration-500 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* corner registration brackets, matching the blueprint */}
      {[
        'left-6 top-6 border-l border-t',
        'right-6 top-6 border-r border-t',
        'left-6 bottom-6 border-b border-l',
        'right-6 bottom-6 border-b border-r',
      ].map((pos) => (
        <span key={pos} className={`absolute h-6 w-6 border-brand-600 ${pos}`} />
      ))}

      <span className="absolute left-6 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-label text-slate-700 sm:block">
        VT26
      </span>
      <span className="absolute right-6 top-1/2 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-label text-slate-700 sm:block">
        DASHBOARD
      </span>

      {/* the mark, drawing itself */}
      <svg viewBox="0 0 200 200" className="h-28 w-28 text-white sm:h-36 sm:w-36" fill="none">
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeOpacity="0.08" />
        <circle
          cx="100"
          cy="100"
          r="66"
          stroke="var(--brand)"
          strokeOpacity="0.35"
          strokeDasharray="2 8"
          className="bp-spin-rev"
          style={{ transformOrigin: '100px 100px' }}
        />
        <path
          d="M28 56 L172 56 L100 178 Z"
          pathLength={1}
          stroke="var(--brand)"
          strokeWidth="3"
          strokeLinejoin="round"
          className="bp-draw"
        />
        <path
          d="M60 74 L100 158 L140 74"
          pathLength={1}
          stroke="#e0685e"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="bp-draw"
          style={{ animationDelay: '0.35s' }}
        />
        <line
          x1="74"
          y1="74"
          x2="126"
          y2="74"
          pathLength={1}
          stroke="#e0685e"
          strokeWidth="2.5"
          className="bp-draw"
          style={{ animationDelay: '0.7s' }}
        />
      </svg>

      {/* status log */}
      <div className="mt-10 h-5 text-center">
        <p className="font-mono text-[11px] uppercase tracking-label text-slate-400">
          {LINES[Math.max(0, step - 1)]}
          <span className="ml-1 inline-block h-3 w-1.5 translate-y-px bg-brand-600 animate-blink" />
        </p>
      </div>

      {/* progress rule */}
      <div className="mt-6 w-56 sm:w-72">
        <div className="h-px w-full bg-white/10">
          <div
            className="h-px bg-brand-600 transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-label text-slate-600">
          <span>V-TAPP 2026</span>
          <span className="tabular-nums">{String(pct).padStart(3, '0')}%</span>
        </div>
      </div>
    </div>
  );
}
